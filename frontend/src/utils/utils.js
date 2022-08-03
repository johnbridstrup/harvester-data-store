import { Oval } from  'react-loader-spinner';


export const Loader = ({size}) => {
  return <Oval color="#00BFFF" height={size} width={size} />
}


export const transformHarvOptions = (harvesters = []) => {
  return harvesters.map((harvester, index) => {
    return {value: harvester.harv_id, label: harvester.harv_id}
  })
}

export const transformLocOptions = (locations = []) => {
  return locations.map((loc, index) => {
    return {value: loc.ranch, label: loc.ranch}
  })
}

const extractServiceCodes = (exceptions=[]) => {
  let services = []
  let codes = []
  exceptions.forEach(exec => {
    services.push(`${exec.service}.${exec.node}`)
    codes.push(exec.code)
  });
  return {services, codes}
}

export const transformErrorReport = (reports = []) => {
  return reports.map((report, index) => {
    const reportObj = {reportId: report.id, created: report.created, lastModified: report.lastModified, reportTime: report.reportTime, creator: report.creator, modifiedBy: report.modifiedBy, location: report.location, harvester: report.harvester, timestamp: report.report.timestamp, serial_number: report.report.data.serial_number, githash: report.report.data.githash, branch_name: report.report.data.branch_name}
    const resultObj = Object.assign({}, reportObj, ...report.exceptions)
    const { services, codes } = extractServiceCodes(report.exceptions);
    resultObj['service'] = services.join(", ")
    resultObj['code'] = codes.join(", ")
    return resultObj
  })
}


export const transformTableErrorReport = (errorreport=[], harvesters=[], locations=[]) => {
  return errorreport.map((report, index) => {
    const harvester = harvesters.find(x => x.id === report.harvester) || {};
    const location = locations.find(x => x.id === report.location) || {};

    return {...report, harvester, location};
  })
}


export const translateHarvOptions = (harv_ids = []) => {
  return harv_ids.map((harv_id, index) => {
    return harv_id.value
  })
}

export const translateLocOptions = (loc_names = []) => {
  return loc_names.map((loc, index) => {
    return loc.value
  })
}


// Datetime formatting
function padZeros(str_to_pad, digits) {
  return str_to_pad.toString().padStart(digits, '0')
}

export function timeStampFormat(dateString, timezone="US/Pacific") {
  let date;
  if (typeof timezone === "string") {
    date = new Date(new Date(dateString).toLocaleString('en-US', {timeZone: timezone}));
  } else {
    date = new Date(dateString);
  }
  let y = date.getFullYear().toString()
  let M = padZeros(date.getMonth() + 1, 2)
  let d = padZeros(date.getDate(), 2)
  let h = padZeros(date.getHours(), 2)
  let m = padZeros(date.getMinutes(), 2)
  let s = padZeros(date.getSeconds(), 2)
  return y + M + d + h + m + s
}


const getDateValues = dateString => {
  let year = Number(dateString.slice(0, 3+1))
  let month = Number(dateString.slice(4, 5+1)) - 1
  let day = Number(dateString.slice(6, 7+1))
  let hours = Number(dateString.slice(8, 9+1))
  let minutes = Number(dateString.slice(10, 11+1))
  let second = Number(dateString.slice(12, dateString.length))
  return {year, month, day, hours, minutes, second}
}


export const extractDateFromString = (dateString) => {
  if (typeof dateString === "string" && dateString.length === 14) {
    let { year, month, day, hours, minutes, second } = getDateValues(dateString);
    return new Date(year, month, day, hours, minutes, second);
  } else if (typeof dateString === "string") {
    let paddedDateString = dateString.padEnd(14, "0");
    let { year, month, day, hours, minutes, second } = getDateValues(paddedDateString);
    return new Date(year, month, day, hours, minutes, second);
  } else {
    return new Date();
  }
}


export const transformTzOptions = (timezones=[]) => {
  return timezones.map((zone, index) => {
    return {value: zone, label: zone}
  })
} 


export const paramsToObject = (params) => {
  const urlparams = new URLSearchParams(params);
  const result = {}
  for(const [key, value] of urlparams.entries()) {
    result[key] = value;
  }
  return result;
}


export const copiedUrl = (paramsObj) => {
  const port = process.env.REACT_APP_FRONTEND_PORT || 3000
  const public_url = process.env.REACT_APP_HOSTED_URL || `http://localhost:${port}`;
  const searchParams = new URLSearchParams(paramsObj);
  return`${public_url}/errorreports/?${searchParams.toString()}`;
}


const reportLimitedObjs = (harvesters=[], locations=[], identity=null, identifier='harvester') => {
  if (identifier === 'harvester') {
    return harvesters.find(x => x.id === identity) || {}
  } else if (identifier === 'location') {
    return locations.find(x => x.id === identity) || {}
  } else {
    return {};
  }
}


export const transformReportDetail = (report={}, harvesters=[], locations=[]) => {
  const reportObj = {...report}
  const { services, codes } = extractServiceCodes(reportObj.exceptions);
  reportObj['service'] = services.join(", ")
  reportObj['code'] = codes.join(", ")
  reportObj['harvester'] = reportLimitedObjs(harvesters, locations, reportObj.harvester, 'harvester')
  reportObj['location'] = reportLimitedObjs(harvesters, locations, reportObj.location, 'location')
  return reportObj;
}


export const transformExceptionObj = (exceptions=[]) => {
  let exceptObj = {};
  exceptions.forEach(obj => {
    exceptObj[`${obj.service}.${obj.node}: ${obj.code}`] = obj
  })
  return exceptObj;
}


export const transformSysmonReport = (sysmonReport = {}) => {
  const sysReport = {}
  let masterIndex = 0
  for (const [key, value] of Object.entries(sysmonReport)) {
    let sysIndex = key.split(".")[1]
    let robotIndex;
    if (sysIndex) {
      sysIndex = Number(sysIndex);
      robotIndex = Number(value['robot_index'] || sysIndex)
    } else {
      continue
    }
    if (sysIndex === masterIndex) {
      sysReport['Master'] = value
    } else if (robotIndex === sysIndex) {
      let robot = `Robot ${robotIndex}`
      if (!sysReport[robot]) {
        sysReport[robot] = {}
      }
      if (!('NUC' in sysReport[robot])) {
        sysReport[robot] = {...sysReport[robot], 'NUC': {}}
      }
      sysReport[robot]['NUC'] = value
    } else {
      let robot = `Robot ${robotIndex}`;
      if (!sysReport[robot]) {
        sysReport[robot] = {}
      }
      if (!('JETSON' in sysReport[robot])) {
        sysReport[robot] = {...sysReport[robot], 'JETSON': {}}
      }
      sysReport[robot]['JETSON'] = value
    }
  }
  return sysReport
}