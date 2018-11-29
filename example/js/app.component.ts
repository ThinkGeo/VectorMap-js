import { Component, AfterViewInit } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit {
  private blockMapStyle;
  private blockMapLayer;
  constructor() {

  }

  ngAfterViewInit() {
    //block  map style 
    this.blockMapStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: '#afaeb1'
      }),
      stroke: new ol.style.Stroke({
        color: '#a59f80',
        width: 2
      }),
      text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: '#525255'
        }),
        placement: 'line',
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 3
        }),
      })
    })

    this.blockMapLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: './assets/data/label.json',
        format: new ol.format.GeoJSON()
      }),
      style: feature => {
        this.blockMapStyle.getText().setText(feature.get('NAME'));
        return this.blockMapStyle;
      }
    })

    let map = new ol.Map({
      layers: [this.blockMapLayer],
      target: 'map',
      view: new ol.View({
        center: ol.proj.fromLonLat([-96.820787, 33.098294]),
        zoom: 17,
      }),
    });
  }

  refresh(formValue: formValueConfig): void {
    console.log(formValue);
    let text = this.blockMapStyle.getText();
    text.setFont(`${formValue.fontSize || 14}px ${formValue.fontFamily || 'sans-serif'},sans-serif`);
    text.getFill().setColor(formValue.fillColor || '#000');
    text.setPlacement(formValue.placement || 'line')
    this.blockMapLayer.setStyle(this.blockMapStyle)
  }
}

interface formValueConfig {
  fontSize?: number,
  fontFamily?: string,
  fillColor?: number,
  placement?: string
};

