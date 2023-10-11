import moment from "moment"


//Ordinal  add in date
const dateHandle = (date) => {
    let day = new Date(date).getDate();
    var b = day % 10;

    if ((day % 100) / 10 === 1) {
        return "th";
    } else if (b === 1) {
        return "st";
    } else if (b === 2) {
        return "nd";
    } else if (b === 3) {
        return "rd";
    } else {
        return "th";
    }
};

export const dateFormat = (date) => {
    return (
        <>
            {moment(date).format("DD")}
            <sup> {dateHandle(date)} </sup>
            {moment(date).format("MMM YYYY")}
        </>
    )
}

export const timeAgo = (date) => {
    moment.updateLocale('en', {
        relativeTime : {
            future: "in%s",
            past:   "%sago",
            s  : 'just now',
            ss : '%ds',
            m:  "1min",
            mm: "%dmin",
            h:  "1h",
            hh: "%dh",
            d:  "1d",
            dd: "%dd",
            M:  "1m",
            MM: "%dm",
            y:  "1yr",
            yy: "%dyr"
        }
    });
   let time =  moment(date).fromNow(true);
   return time;
}