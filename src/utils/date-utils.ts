import moment from "moment";
import { DATE_COMMENTS_FORMAT } from "../constants/date.constants";
import { DATE_ORDER } from "../enums/date.enum";

export const compareDates = (date1: string, date2: string, order: DATE_ORDER) => {
  if (order === DATE_ORDER.asc) {
    if ((moment(date1, DATE_COMMENTS_FORMAT).valueOf() > (moment(date2, DATE_COMMENTS_FORMAT).valueOf()))) {
      return -1;
    } else if ((moment(date1, DATE_COMMENTS_FORMAT).valueOf() < (moment(date2, DATE_COMMENTS_FORMAT).valueOf()))) {
      return 1;
    }
    return 0;
  } else {
    if ((moment(date1, DATE_COMMENTS_FORMAT).valueOf() < (moment(date2, DATE_COMMENTS_FORMAT).valueOf()))) {
      return -1;
    } else if ((moment(date1, DATE_COMMENTS_FORMAT).valueOf() > (moment(date2, DATE_COMMENTS_FORMAT).valueOf()))) {
      return 1;
    }
    return 0;
  }
}