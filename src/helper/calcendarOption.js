import moment from "moment";

// calcendar option
const ranges = {
    Today: [moment(), moment()],
    Yesterday: [
        moment().subtract(1, "days"),
        moment().subtract(1, "days")
    ],
    // "Last 7 Days": [moment().subtract(6, "days"), moment()],
    // "Last 30 Days": [moment().subtract(29, "days"), moment()],
    "Current Week": [moment().startOf("week"), moment().endOf("week")],
    "Last Week": [
        moment().subtract(1, "week").startOf("week"),
        moment().subtract(1, "week").endOf("week")
    ],
    "This Month": [moment().startOf("month"), moment().endOf("month")],
    "Last Month": [
        moment()
            .subtract(1, "month")
            .startOf("month"),
        moment()
            .subtract(1, "month")
            .endOf("month")
    ]
};

export default ranges;