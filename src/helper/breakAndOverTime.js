import moment from "moment";

export const calculatorOverTime = (data) => {
    const sumHoras = [0, 0];
    for (let i = 0; i < data.length; i++) {
        const [hours, minutes] = data[i].totalHours.split(':').map(s => parseInt(s, 10));
    
        // hours
        sumHoras[0] += hours;
    
        // minutes
        if ((sumHoras[i] + minutes) > 59) {
            const diff = sumHoras[1] + minutes - 60;
            sumHoras[0] += 1;
            sumHoras[1] = diff;
        } else {
            sumHoras[1] += minutes;
        }
    }
    if (sumHoras[0] > 8) {
        sumHoras[0] -= 8
        return sumHoras.join(':');
    }else{
        return 0
    }
}

export const calculatorBreakTime = (data) => {
    const breakTimes = data.map((val, index) => {
        if (index < data.length - 1) {
            const diff = moment.utc(moment(data[index + 1].clock_in, "HH:mm:ss A").diff(moment(val.clock_out, "HH:mm:ss A"))).format("HH:mm")
            return diff;
        }
    })
    const sumHoras = [0, 0];
    const filterData = breakTimes.filter(function (element) {
        return element !== undefined;
    });

    for (let i = 0; i < filterData.length; i++) {
        const [hours, minutes] = filterData[i].split(':').map(s => parseInt(s, 10));

        // hours
        sumHoras[0] += hours;

        // minutes
        if ((sumHoras[i] + minutes) > 59) {
            const diff = sumHoras[1] + minutes - 60;
            sumHoras[0] += 1;
            sumHoras[1] = diff;
        } else {
            sumHoras[1] += minutes;
        }
    }
    return sumHoras.join(':');
}