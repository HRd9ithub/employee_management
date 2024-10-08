import React, { memo, useEffect, useState } from 'react'
import moment from 'moment';

const Clock = ({ handleClick, toggle }) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(moment(new Date()).format("hh:mm:ss A"));
    }, 1000)

    return () => clearInterval(intervalId);
  }, [])

  return (
    <div className="mt-3 text-center">
      <div className="clock d-flex justify-content-center align-items-center">
        <h2 className="mb-0 text-center">{time}</h2>
      </div>
      <div className="mt-3">
        <button type="submit" className="btn btn-gradient-primary" onClick={handleClick}>{toggle ? "Punch Out" : "Punch In"}</button>
      </div>
    </div>)
}

export default memo(Clock);