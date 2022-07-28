import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Select from 'react-select';
import { timeStampFormat, transformHarvOptions, transformLocOptions, translateHarvOptions, translateLocOptions } from '../../utils/utils';
import { queryErrorReport } from '../../features/errorreport/errorreportSlice';

function ErrorReportQuery(props) {
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [datesQuery, setDatesQuery] = useState({
    start_time: '',
    end_time: ''
  })
  const count = useSelector(state => state.errorreport.count);
  const { harvesters } = useSelector(state => state.harvester);
  const { locations } = useSelector(state => state.location);
  const harvesterOptions = transformHarvOptions(harvesters);
  const locationOptions = transformLocOptions(locations);
  const dispatch = useDispatch()

  const handleHarvestSelect = (newValue, actionMeta) => {
    setSelectedHarvId(current => newValue)
  }

  const handleLocationSelect = (newValue, actionMeta) => {
    setSelectedLocation(current => newValue)
  }

  const handleFormQuerySubmit = async e => {
    e.preventDefault();
    let queryObj = {}
    if (datesQuery.start_time) {
      queryObj['start_time'] = timeStampFormat(datesQuery.start_time)
    }
    if (datesQuery.end_time) {
      queryObj['end_time'] = timeStampFormat(datesQuery.end_time)
    }
    if (selectedHarvId && selectedHarvId.length > 0) {
      queryObj['harv_ids'] = translateHarvOptions(selectedHarvId)
    }
    if (selectedLocation && selectedLocation.length > 0) {
      queryObj['locations'] = translateLocOptions(selectedLocation)
    }
    await dispatch(queryErrorReport(queryObj));
  }

  const handleDateChange = e => {
    setDatesQuery(current => {
      return {...current, [e.target.name]: e.target.value}
    });
  }

  return (
    <div className='row'>
      <div className='col-lg-10 col-md-8 col-sm-12'>
        <div>
          <form onSubmit={handleFormQuerySubmit}>
            <div className='row mb-4 mt-2'>
              <div className='col-md-6'>
                <div className='form-group'>
                  <label htmlFor='harv_ids'>Harv IDS</label>
                  <Select isMulti isSearchable placeholder="1,2,3,..." options={harvesterOptions} name="harv_ids" onChange={handleHarvestSelect} defaultValue={selectedHarvId} className="multi-select-container" classNamePrefix="select" />
                </div>
              </div>
              <div className='col-md-6'>
                <div className='form-group'>
                  <label htmlFor='locations'>Ranches</label>
                  <Select isMulti isSearchable placeholder="ranch1, ranch2, ..." options={locationOptions} name="locations" onChange={handleLocationSelect} defaultValue={selectedLocation} className="multi-select-container" classNamePrefix="select" />
                </div>
              </div>
            </div>
            <div className='row mb-4'>
              <div className='col-md-6'>
                <div className='form-group'>
                  <label htmlFor='start_time'>Start Time</label>
                  <InputFormControl type="text" name='start_time' value={datesQuery.start_time} onChange={handleDateChange} placeholder="YYYYMMDDHHmmSS" maxLength={14} />
                </div>
              </div>
              <div className='col-md-6'>
                <div className='form-group'>
                  <label htmlFor='end_time'>End Time</label>
                  <InputFormControl type="text" name='end_time' value={datesQuery.end_time} onChange={handleDateChange} placeholder="YYYYMMDDHHmmSS" maxLength={14} />
                </div>
              </div>
            </div>
            <div className='form-group'>
              <button type='submit' className='btn btn-primary btn-md'>Submit</button>
            </div>
          </form>
        </div>
      </div>
      <div className='col-lg-2 col-md-4 col-sm-12'>
        <DivTotalReport className='total-report'>
          <span>Total Report</span><span>{count}</span>
        </DivTotalReport>
      </div>
    </div>
  )
}


const DivTotalReport = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  & span {
    font-size: 1.6rem;
    margin-right: .5rem;
  }
`;


const InputFormControl = styled.input`
  display: block;
  width: 90%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0.375rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;

  @media (max-width: 768px) {
    width: 100%;
  }

`;

ErrorReportQuery.propTypes = {};

export default ErrorReportQuery;
