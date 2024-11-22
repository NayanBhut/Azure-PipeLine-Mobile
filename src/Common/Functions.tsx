const getDateDiff = (strdate2: string | null, strdate1: string | null) => {
  if (strdate2 === null || strdate1 === null) {
    return '';
  }

  const date1 = new Date(strdate1);
  const date2 = new Date(strdate2);
  const diffTime: number = Math.abs(date2.valueOf() - date1.valueOf());

  const days = Math.floor(diffTime / (24 * 60 * 60 * 1000));
  const daysms = diffTime % (24 * 60 * 60 * 1000);
  const hours = Math.floor(daysms / (60 * 60 * 1000));
  const hoursms = diffTime % (60 * 60 * 1000);
  const minutes = Math.floor(hoursms / (60 * 1000));
  const minutesms = diffTime % (60 * 1000);
  const sec = Math.floor(minutesms / 1000);

  var time = '';

  if (days > 0) {
    time += days + ' days ';
  }
  if (hours > 0) {
    time += hours + ' hours ';
  }
  if (minutes > 0) {
    time += minutes + ' minutes ';
  }
  if (sec > 0) {
    time += sec + ' sec ';
  }

  return `Running time: ~ ${time}`;
};

export default getDateDiff;
