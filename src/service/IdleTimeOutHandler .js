
import { useEffect } from 'react';
import { GetLocalStorage, clearLocalStorage } from './StoreLocalStorage';

const IdleTimeOutHandler = () => {
    let date = new Date();

    // add a day
    date.setDate(date.getDate() + 1);
    let timer = 100 * 60000;
    // 'click','scroll','load','keydown'
    const events = ["keypress", "mousemove", "touchmove", "mousedown"];
    let timeoutId;

    // time clearup
    const eventHandler = (eventType) => {
        clearTimeout(timeoutId);
        startTimer();
    };

    // logout funtionality
    const handleactive = () => {
        if (GetLocalStorage("token")) {
            clearLocalStorage()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

export default IdleTimeOutHandler;