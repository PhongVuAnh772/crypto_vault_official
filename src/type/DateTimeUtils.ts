import moment from "moment";

const formatTimeWithTimezone = (
  isoDateString: string | number,
  formatter?: string
): string => {
  try {
    if (isoDateString === undefined) {
      return "";
    }
    return moment(isoDateString)
      .local()
      .format(formatter ?? "h:mm A");
  } catch (error) {
    console.log("formatTimeWithTimezone error", error);
    return "";
  }
};
const convertTimestampToISO = (timestamp: number) => {
  return moment.unix(timestamp).toISOString();
};

function formatDateToCustomFormat(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function formatDateToDDMM(dateString: string) {
  const date = new Date(dateString);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${day}-${month}`;
}

const isOngoing = (dateString: string): boolean => {
  const currentDate = moment();
  const targetDate = moment(dateString);
  return currentDate.isBefore(targetDate);
};

const isUpComing = (startDate: string): boolean => {
  const now = moment();
  const start = moment(startDate);
  return start.isAfter(now);
};

const formatDateTimeStandard = (date: string) => {
  return moment.utc(date).local().format("MMM D, YYYY h:mm A");
};

const DateTimeUtils = {
  formatTimeWithTimezone,
  convertTimestampToISO,
  formatDateToCustomFormat,
  formatDateToDDMM,
  isOngoing,
  isUpComing,
  formatDateTimeStandard,
};

export default DateTimeUtils;
