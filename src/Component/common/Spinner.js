import React, { Component } from 'react'

export class Spinner extends Component {
  render() {
    return (
      <div className='spinner'>
            <div className="spinner-box">
                <img src='/images/d9.png' alt='spinner' />
                <div className='dot-one'></div>
                <div className='dot-two'></div>
            </div>
        </div>
    )
  }
}

export default Spinner
