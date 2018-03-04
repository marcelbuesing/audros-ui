import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import {XYPlot, XAxis, YAxis,HeatmapSeries, Hint, DiscreteColorLegend} from 'react-vis';
import Color from 'color';


const randomTemp = () => Math.floor(Math.random()*((40)-(-50)+1)+(-50));

const days = Array.from({length: 31}, (v, i) => i + 1);

const hours = Array.from({length: 24}, (v, i) => i);

const testData = days.reduce((acc, d) => {
  const rand = randomTemp();
  const v = hours.map(h => {
    const temp = h < 12 ? rand - (12 -h) : rand - Math.abs(h - 12);
    const rangeTemp = Math.min(40, Math.max(-50, temp));
    return {x: d, y: h, temperature: rangeTemp };
  });
  return acc.concat(v);
}, []);

const ranges = [
  {
    low: -50,
    high: -15,
    lowColor: Color("#0D47A1"),
    highColor: Color("#1565C0")
  },
  {
    low: -15,
    high: 9,
    lowColor: Color("#1565C0"),
    highColor: Color("#2196F3")
  },
  {
    low: 9,
    high: 25,
    lowColor: Color("#00B0FF"),
    highColor: Color("#00E676")
  },
  {
    low: 25,
    high: 50,
    lowColor: Color("#FFEB3B"),
    highColor: Color("#FF3D00")
  }
];

const temperatureColor = (temperature) => {
  const range = ranges.find(r => (r.low <= temperature && temperature <= r.high));
  if (typeof(range) == "undefined") {
    throw "Temperature " + temperature;
  }
  const diff = Math.abs(range.high - Math.abs(range.low));
  const darkenPercent = Math.abs(diff - Math.abs(temperature)) / diff;
  const rgbColor = range.lowColor.mix(range.highColor, darkenPercent * 2).rgb();
  return rgb2hex(rgbColor.color[0], rgbColor.color[1], rgbColor.color[2]);
};

const rgb2hex = (red, green, blue) => {
  var rgb = blue | (green << 8) | (red << 16);
  return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
    this._rememberValue = this._rememberValue.bind(this);
    this._forgetValue = this._forgetValue.bind(this);
  }

  _rememberValue(value) {
    this.setState({value});
  }

  _forgetValue() {
    this.setState({
      value: null
    });
  }

  render() {
    const {value} = this.state;
    const data = testData.map(d => {
      d["color"] = temperatureColor(d.temperature);
      return d;
    });

    const legendItems = ranges.reduce((acc, range) => {
      const rgbColor = range.highColor.rgb();
      const hexColor = rgb2hex(rgbColor.color[0], rgbColor.color[1], rgbColor.color[2]);
      acc.push(
        {
          title: range.high + "°",
          color:hexColor,
          disable: false
        });
      return acc;
    }, []);

    const hintValue = value == null ?  "" : { temperature: value.temperature + "°", time: value.y, date: value.x };
    return (
      <div className="App">
        <XYPlot
          width={900}
          height={500}
          xDomain={[1, 31]}
          yDomain={[24, 0]}
        >
          <XAxis/>
          <YAxis />
          <DiscreteColorLegend items={legendItems} orientation="horizontal"/>
          <HeatmapSeries
          className="heatmap-series-example"
          data={data}
                colorType="literal"
                onValueMouseOver={this._rememberValue}
                onValueMouseOut={this._forgetValue}
              />
              {value ?
               <Hint value={hintValue}/> :
               null
              }
        </XYPlot>
      </div>
    );
  }
}

export default App;
