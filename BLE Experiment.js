 // listen to xiaomi MJ_HT_V1 temperature / humidity BLE messaging
 // remember to enable bluetooth 
 // set sensor to config and address from messages
 // if sensorAddress is not set will go trough all such a devices
 // no battery level supported yet

let CONFIG = {
  sensorName: "MJ_HT_V1",
  sensorAddress: ""
};
let latestTemperature = null;
let latestHumidity = null;

let MJHTV1_SERVICE_UUID = "FE95";
let MJHTV1_DATABYTE_BEGIN = 11;
let MJHTV1_DATABYTE_BEGINWITHUUID = 13;
let MJHTV1_MODE_TEMPERATURE = 0x04;
let MJHTV1_MODE_HUMIDITY = 0x06;
let MJHTV1_MODE_BATTERY = 0x0A;
let MJHTV1_MODE_TEMPERATUREANDHUMIDITY = 0x0D;
let MJHTV1_DIVIDER_TEMPERATURE = 10.0;
let MJHTV1_DIVIDER_HUMIDITY = 10.0;
let MJHTV1_DIVIDER_BATTERY = 1.0;

function ParseMJHTV1Data(data, source)
{
  let begin = MJHTV1_DATABYTE_BEGIN;
  if (data.at(0) === 0x95 && data.at(1) === 0xFE) begin = MJHTV1_DATABYTE_BEGINWITHUUID;
  let mode = data.at(begin);
  if (mode === MJHTV1_MODE_BATTERY) return; // no use for battery values at the moment
  if (mode === MJHTV1_MODE_TEMPERATURE)
  {
  	let temperature = (data.at(begin + 3) + (data.at(begin + 4) * 256)) / MJHTV1_DIVIDER_TEMPERATURE;
	latestTemperature = temperature;
  }
  if (mode === MJHTV1_MODE_HUMIDITY)
  {
   	let humidity = (data.at(begin + 3) + (data.at(begin + 4) * 256)) / MJHTV1_DIVIDER_HUMIDITY;
	latestHumidity = humidity;
  }
  if (mode === MJHTV1_MODE_TEMPERATUREANDHUMIDITY)
  {
	let temperature = (data.at(begin + 3) + (data.at(begin + 4) * 256)) / MJHTV1_DIVIDER_TEMPERATURE;
	latestTemperature = temperature;
    let humidity = (data.at(begin + 5) + (data.at(begin + 6) * 256)) / MJHTV1_DIVIDER_HUMIDITY;
	latestHumidity = humidity;
  }
  print("values from ", source, "temperature:", latestTemperature, "humidity:", latestHumidity)
  // publish to mqtt or where ever is needed to
}
  
function bleResult(event, result)
{
  if (event !== BLE.Scanner.SCAN_RESULT) return;
  if (result === null) return;
  let sensorName = BLE.GAP.ParseDataByEIRType(result.scanRsp, BLE.GAP.EIR_FULL_NAME);
  if (sensorName !== CONFIG.sensorName) return;
  if (CONFIG.sensorAddress !== "" && result.addr !== CONFIG.sensorAddress) return;
  let datas = BLE.GAP.ParseServiceData(result.advData, MJHTV1_SERVICE_UUID);
  ParseMJHTV1Data(datas, result.addr);
}

// scan for ble devices 
BLE.Scanner.Start({ 
   duration_ms: BLE.Scanner.INFINITE_SCAN,
   active: true }, bleResult);
