import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from '@angular/common';
import { loadModules } from "esri-loader";
import { Router } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-state-map',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './state-map.component.html',
  styleUrl: './state-map.component.css'
})

export class StateMapComponent implements OnInit {

  constructor(private _router: Router) { }

  state_map_details: any = JSON.parse(sessionStorage.getItem('state-map-details') || '');
  state_id_params: any;
  center_for_state: any[] =[];
  showMap: boolean = false;
  map: any;
  highlighterMap = new Map();

  ngOnInit() {
    this.initializeMap();
    this.state_id_params = this.state_map_details?.stateId;
    this.center_for_state = [this.state_map_details?.longitude,this.state_map_details?.latitude];
  }


  stateArcUrl = "https://mapservice.gov.in/gismapservice/rest/services/BharatMapService/Admin_Boundary_Village/MapServer";
  stateArcKey = "AYoPi0yUpPCJsWAW5QDg0K1addTUhmtdg9EzfsXjyJDwgWGuUlRb0agTOejvK6RP-7KnKiszVZozignazCey6g..";

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
        'esri/symbols/PictureMarkerSymbol'
      ], options);


      var EmptyBasemap = {
        baseMapLayers: [{ url: "https://webgis1.nic.in/publishing/rest/services/bharatmaps/nuis/MapServer", opacity: 0.9 }],
        title: "NIC Street"
      };



      this.map = new Map("bmap", {
        basemap: EmptyBasemap,

        center: this.center_for_state,
        zoom: 7,
        logo: false,
        showAttribution: false,
        slider: true,
        smartNavigation: true
      });
      this.map.disableScrollWheel();
      this.map.infoWindow.resize(240, 160);

      

      var stateQueryTask = new QueryTask(this.stateArcUrl + "/1?Token=" + this.stateArcKey);// 0->State 1->District
      var stateQuery = new Query();
      stateQuery.returnGeometry = true;
      stateQuery.outFields = ["*"];
      stateQuery.where = "stcode11='" + this.state_id_params + "'";

      this.map.on("load", () => {
        stateQueryTask.execute(stateQuery).then((jsnFset: any) => {
          var i=0;
          this.showMap = true;
          jsnFset.features.forEach((feature: any) => {
            var state_id = feature.attributes.stcode11;
            var state_nm = feature.attributes.stname;
            var dist_id = feature.attributes.dtcode11;
            var dist_name = feature.attributes.dtname;
            if ('' + state_nm + '' == 'undefined') {
              state_id = feature.attributes.STCODE11;
              state_nm = feature.attributes.STNAME;
              dist_id = feature.attributes.dtcode11;
              dist_name = feature.attributes.dtname;
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
              district_id: dist_id,
              district_name: dist_name,
              color_code: color,
              type: "district-map"
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
              // text: dist_name,
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

          if (event_step == 1 && (event_type == 'district-map')) {
            //---------------------------------------------
            this.map.graphics.remove(this.highlighterMap.get("highlightPolyLine"));
            var highlightColor = new Color([0,255,0]);
            var highlightLine = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, highlightColor, 1);
            var highlightPolyLine = new Graphic(event.graphic.geometry, highlightLine);
            this.map.graphics.add(highlightPolyLine);
            this.highlighterMap.set("highlightPolyLine", highlightPolyLine);

            //--------------------------------------------- 	


            var state_id = data_set.state_id;
            var event_state_nm = data_set.state_nm;
            var dist_id = data_set.district_id;
            var dist_name = data_set.district_name;

            var infoTemplate = `<table style='font-family: arial, sans-serif; width: 100%;border: 1px solid #e7d8d8'>
            <tr>
              <th style='width:20%;background-color:#132554;color:white;border: 1px solid white'>State Id</th>
              <th style='width:20%;background-color:#132554;color:white;border: 1px solid white'>District Id</th>
                <th style='width:20%;background-color:#132554;color:white;border: 1px solid white'>District Name</th>
                <th style='width:20%;background-color:#132554;color:white;border: 1px solid white'>Country</th>
            </tr>
            <tr>
               <td style='width:20%;border: 1px solid #e7d8d8; font-size:09px'>${state_id}</td>
               <td style='width:20%;border: 1px solid #e7d8d8; font-size:09px'>${dist_id}</td>
               <td style='width:20%;border: 1px solid #e7d8d8; font-size:09px'>${dist_name} </td>
              <td style='width:20%;border: 1px solid #e7d8d8; font-size:09px'>India</td>
            </tr>
            </table>`;

            this.map.infoWindow.setContent(infoTemplate);
            this.map.infoWindow.setTitle(`<div style='font-size:15px;font-family:arial, sans-serif;background-color:#3f51b5;color:white'>State :  ${event_state_nm}  data</div>`);

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
          if (event_step == 1 && (event_type == 'district-map')) {
            var point = new Point(graphic.geometry.getCentroid());
            var latitude = point.getLatitude();
            var longitude = point.getLongitude();

            var state_id = graphic.attributes.state_id;
            var dist_id = graphic.attributes.district_id;
            let obj = {
              stateId: state_id,
              districtId: dist_id,
              latitude: latitude,
              longitude: longitude
            }
            sessionStorage.setItem('vt-map-details', JSON.stringify(obj))
            this._router.navigateByUrl('district-map')
          }
        }
      });


    } catch (error) {
      console.error("EsriLoader: ", error);
    }
  }



 


}