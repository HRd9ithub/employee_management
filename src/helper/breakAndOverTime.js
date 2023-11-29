import moment from "moment";

export const calculatorOverTime = (data) => {
    const sumHoras = sum(data)
    if (sumHoras[0] > 8) {
        sumHoras[0] -= 8
        return sumHoras.join(':');
    }else{
        return 0
    }
}

export const calculatorBreakTime = (value) => {

    const data = value.sort(function (a, b) {
        // Convert the date strings to Date objects
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        // Subtract the dates to get a value that is either negative, positive, or zero
        return dateA - dateB;
    });

    let breakTimes = [];

    data.forEach((val, index) => {
        if (index < data.length - 1) {
            const diff = moment.utc(moment(data[index + 1].clock_in, "HH:mm:ss A").diff(moment(val.clock_out, "HH:mm:ss A"))).format("HH:mm")
            breakTimes.push(diff);
        }
    })
    const sumHoras = [0, 0];

    for (let i = 0; i < breakTimes.length; i++) {
        const [hours, minutes] = breakTimes[i].split(':').map(s => parseInt(s, 10));

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
    if (sumHoras.join(':') !== "0:0") {
        return sumHoras.join(':');
    } else {
        return 0
    }
}

export const sum = (data) => {
    const removeData = data.filter((item) => item.hasOwnProperty("totalHours"))
    const sumHoras = [0, 0];

    removeData.forEach((element,i) => {
        const [hours, minutes] = element.totalHours.split(':').map(s => parseInt(s, 10));
    
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
    });

    if (sumHoras.join(':') !== "0:0") {
        return sumHoras.join(':');
    } else {
        return 0
    }
}