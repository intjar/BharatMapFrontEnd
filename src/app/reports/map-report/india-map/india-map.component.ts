import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from '@angular/common';
import { loadModules } from "esri-loader";
import { Router } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-india-map',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './india-map.component.html',
  styleUrl: './india-map.component.css'
})
export class IndiaMapComponent implements OnInit {

  constructor(private _router: Router) { }


  stateArcUrl = "https://mapservice.gov.in/gismapservice/rest/services/BharatMapService/Admin_Boundary_Village/MapServer";
  stateArcKey = "AYoPi0yUpPCJsWAW5QDg0PC4uO_lxb5JGyJajKwyMUBWB-X2MB_XkuK3wFDwHj_xcNuQY5ioZvm51G6MNJiVfg..";
  map: any;
  showMap: boolean = false;
  highlighterMap = new Map();


  async initializeMap() {

    try {
      const options = { version: '3.45', css: true };
      const [Map, QueryTask, Query, SimpleFillSymbol, SimpleLineSymbol, Polygon, Graphic, TextSymbol, Color, Point, PictureMarkerSymbol
      ] = await loadModules([
        'esri/map',
        'esri/tasks/QueryTask',
        'esri/tasks/query',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/geometry/Polygon',
        'esri/graphic',
        'esri/symbols/TextSymbol',
        'esri/Color',
        'esri/geometry/Point',
        'esri/symbols/PictureMarkerSymbol',
        'dojo/domReady!'
      ], options);


      var EmptyBasemap = {
        baseMapLayers: [{ url: "https://webgis1.nic.in/publishing/rest/services/bharatmaps/nuis/MapServer", opacity: 0.9 }],
        title: "NIC Street"
      };



      this.map = new Map("bmap", {
        basemap: EmptyBasemap,

        center: [83.00, 24.000],
        zoom: 5,
        logo: false,
        showAttribution: false,
        slider: true,
        smartNavigation: true
      });
      this.map.disableScrollWheel();
      this.map.infoWindow.resize(240, 160);



      var stateQueryTask = new QueryTask(this.stateArcUrl + "/0?Token=" + this.stateArcKey);// 0->State 1->District
      var stateQuery = new Query();
      stateQuery.returnGeometry = true;
      stateQuery.outFields = ["*"];
      stateQuery.where = "1=1";

      this.map.on("load", () => {
        stateQueryTask.execute(stateQuery).then((jsnFset: any) => {
          var i=0;
          this.showMap = true;
          jsnFset.features.forEach((feature: any) => {
            var state_id = feature.attributes.stcode11;
            var state_nm = feature.attributes.stname;

            if ('' + state_nm + '' == 'undefined') {
              state_id = feature.attributes.STCODE11;
              state_nm = feature.attributes.STNAME;
            }

            var style = SimpleFillSymbol.STYLE_SOLID;
            var outline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([83, 86, 36]), 1);
            var color = new Color([251, 242, 233, 0.7]);
            if(i%2!=0){
              color = new Color([170, 183, 155]);
            } i++;
            var sfs = new SimpleFillSymbol(style, outline, color);
            var gmtry = new Polygon(feature.geometry);

            //-----------------------------------------------
            // var centroid = gmtry.getCentroid();
            // var myPosition = new Point(centroid);
            // // var myPosition = new esri.geometry.Point( 16, 72);
            // var url = "https://cdn-icons-png.flaticon.com/512/2838/2838912.png";
            // var infoSymbol = new PictureMarkerSymbol(url, 20, 20);
            // labelPointGraphic = new Graphic(myPosition, infoSymbol);
            // this.map.graphics.add(labelPointGraphic);
            //-----------------------------------------------

            var attr = {
              step: 1,
              state_id: state_id,
              state_nm: state_nm,
              color_code: color,
              type: "state-map"
            };

            var infoGraphic = new Graphic(
              gmtry,
              sfs,
              attr
            );

            this.map.graphics.add(infoGraphic);

            var textSymbol = new TextSymbol({
              color: "black",
              haloColor: "black",
              haloSize: "1px",
              //text: state_nm,
              font: {
                size: 7,
                family: "sans-serif",
                weight: "bolder"
              }
            });

            var labelPointGraphic = new Graphic(gmtry, textSymbol, attr); //create label graphic                
            this.map.graphics.add(labelPointGraphic);
          });

          
        });
      });






      this.map.on("mouse-move", (event: any) => {
        var graphic = event.graphic;
        if (graphic && graphic != 'undefined') {
          var data_set = graphic.attributes;
          var event_step = data_set.step;
          var event_type = data_set.type;

          if (event_step == 1 && (event_type == 'state-map')) {



            //---------------------------------------------
            this.map.graphics.remove(this.highlighterMap.get("highlightPolyLine"));
            var highlightColor = new Color([0, 255, 0]);
            var highlightLine = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, highlightColor, 1);
            var highlightPolyLine = new Graphic(event.graphic.geometry, highlightLine);
            this.map.graphics.add(highlightPolyLine);
            this.highlighterMap.set("highlightPolyLine", highlightPolyLine);

            //--------------------------------------------- 	


            var state_id = data_set.state_id;
            var state_nm = data_set.state_nm;

            var infoTemplate = `<table style='font-family: arial, sans-serif; width: 100%;border: 1px solid #e7d8d8'>
                      <tr>
                          <th style='width:30%;background-color:#132554;color:white;border: 1px solid white'>State Name</th>
                          <th style='width:30%;background-color:#132554;color:white;border: 1px solid white'>State Id</th>
                          <th style='width:30%;background-color:#132554;color:white;border: 1px solid white'>Country</th>
                          <th style='width:30%;background-color:#132554;color:white;border: 1px solid white'>Country</th>
                      </tr>
                      <tr>  
                         <td style='width:30%;border: 1px solid #e7d8d8; font-size:09px;color: rgb(9, 87, 231);'>${state_nm}</td>
                         <td style='width:30%;border: 1px solid #e7d8d8; font-size:09px'>${state_id} </td>
                        <td style='width:30%;border: 1px solid #e7d8d8; font-size:09px'>India</td>
                        <td style='width:30%;border: 1px solid #e7d8d8; font-size:09px'>India</td>
                      </tr>
                      </table>`;

            this.map.infoWindow.setContent(infoTemplate);
            this.map.infoWindow.setTitle(`<div style='font-size:15px;font-family:arial, sans-serif;background-color:#3f51b5;color:white'>State :  ${state_nm}  data</div>`);

            this.map.infoWindow.show(event.screenPoint, this.map.getInfoWindowAnchor(event.screenPoint));

          } else {
            this.map.infoWindow.hide();
            try { this.map.graphics.remove(this.highlighterMap.get("highlightPolyLine")); } catch (err) { }
          }
        } else {
          this.map.infoWindow.hide();
          try { this.map.graphics.remove(this.highlighterMap.get("highlightPolyLine")); } catch (err) { }
        }
      });


      // this.map.infoWindow.on("hide", (fs:any) =>  {   
      //   try{ this.map.graphics.remove( this.highlighterMap.get("stateHighlightPolyLine") ); }catch(err){}

      // });


      this.map.on("click", (event: any) => {
        var graphic = event.graphic;
        if (graphic && graphic != 'undefined') {
          var event_step = graphic.attributes.step;
          var event_type = graphic.attributes.type;

          if (event_step == 1 && (event_type == 'state-map')) {
            var point = new Point(graphic.geometry.getCentroid());
            var latitude = point.getLatitude();
            var longitude = point.getLongitude();

            let obj = {
              stateId: graphic.attributes.state_id,
              latitude: latitude,
              longitude: longitude
            }
            sessionStorage.setItem('state-map-details', JSON.stringify(obj))
            this._router.navigateByUrl('state-map')
          }
        }
      });


    } catch (error) {
      console.error("EsriLoader: ", error);
    }
  }



  ngOnInit() {
    this.initializeMap();
  }


}