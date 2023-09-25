
import React, { useEffect } from 'react';
import { GetLocalStorage } from './StoreLocalStorage';
// import { Globalcomponent } from '../Component/auth_context/GlobalComponent';
import GlobalPageRedirect from "../Component/auth_context/GlobalPageRedirect"

const IdleTimeOutHandler = () => {
    var date = new Date();

    // add a day
    date.setDate(date.getDate() + 1);
    let timer = 100 * 60000;
    // 'click','scroll','load','keydown'
    const events = ["keypress", "mousemove", "touchmove", "mousedown"];
    let timeoutId;

    let { getCommonApi } = GlobalPageRedirect();

    // time clearup
    const eventHandler = (eventType) => {
        clearTimeout(timeoutId);
        startTimer();
    };

    // logout funtionality
    const handleactive = () => {
        if (GetLocalStorage("token")) {
            getCommonApi()
        }
    }

    const startTimer = () => {
        // timer after call function
        timeoutId = setTimeout(handleactive, timer);
    }

    // add event function
    const addEvents = () => {

        events.forEach(eventName => {
            window.addEventListener(eventName, eventHandler, false)
        })

        startTimer();
    }

    //
    useEffect(() => {
        addEvents();
    }, [])
}

export default IdleTimeOutHandler;