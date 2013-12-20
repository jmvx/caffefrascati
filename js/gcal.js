/*******************************************************************************
 * gcal.js
 *
 * Copyright (c) 2013 Julia Van Cleve
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************************************/


// Generated by the http://momentjs.com/timezone/data/
moment.tz.add({
   "zones": {
       "America/Los_Angeles": [
           "-7:52:58 - LMT 1883_10_18_12_7_2 -7:52:58",
           "-8 US P%sT 1946 -8",
           "-8 CA P%sT 1967 -8",
           "-8 US P%sT"
       ]
   },
   "rules": {
       "US": [
           "1918 1919 2 0 8 2 0 1 D",
           "1918 1919 9 0 8 2 0 0 S",
           "1942 1942 1 9 7 2 0 1 W",
           "1945 1945 7 14 7 23 1 1 P",
           "1945 1945 8 30 7 2 0 0 S",
           "1967 2006 9 0 8 2 0 0 S",
           "1967 1973 3 0 8 2 0 1 D",
           "1974 1974 0 6 7 2 0 1 D",
           "1975 1975 1 23 7 2 0 1 D",
           "1976 1986 3 0 8 2 0 1 D",
           "1987 2006 3 1 0 2 0 1 D",
           "2007 9999 2 8 0 2 0 1 D",
           "2007 9999 10 1 0 2 0 0 S"
       ],
       "CA": [
           "1948 1948 2 14 7 2 0 1 D",
           "1949 1949 0 1 7 2 0 0 S",
           "1950 1966 3 0 8 2 0 1 D",
           "1950 1961 8 0 8 2 0 0 S",
           "1962 1966 9 0 8 2 0 0 S"
       ]
   },
   "links": {}
});

// Render in English, to match the rest of the site
moment.lang('en');

// A Moment.js extension for displaying the date the way we want to
moment.fn.toJuliaString = function() {
  // Simply "Friday, December 20"
  return this.format("dddd, MMMM D");
}

moment.fn.toJuliaStringWithTime = function() {
  console.log(this.format());
  // Build it up to "Friday, December 20 at "
  var str = this.toJuliaString() + " at ";
  
  // Now we'll display the hours separately
  var isMidnight = (this.hours() == 0 && this.minutes() == 0);
  var isNoon = (this.hours() == 12 && this.minutes() == 0);
  var isNoonOrMidnight = (isMidnight || isNoon);
  
  if (isMidnight)
    str += "midnight"
  else if (isNoon)
    str += "noon"
  else
    str += this.format("h");
  
  if (this.minutes() > 0)
    str += this.format(":mm");
  
  if (!isNoonOrMidnight)
    str += this.format(" A");
  
  return str;
}

function GCalEvents(calendar_json_url, target) {
  // get list of upcoming events
  $.getJSON(calendar_json_url, function(data) {
    // Use the default timezone for the calendar for display
    var timezone = data.feed.gCal$timezone.value;
    
    // Distill events down to the information we care about
    var events = new Array();
    $.each(data.feed.entry, function(i, item) {
      var ev = {};
      ev.title = item.title.$t;
      ev.content = item.content.$t;
      
      // Parse the date as an ISO-8601 string, assuming the default timezone
      // if one is not provided
      var start = item.gd$when[0].startTime;
      if (moment.parseZone(start).zone() === 0)
        ev.date = moment.tz(start, timezone);
      else
        ev.date = moment(start).tz(timezone);
      
      // Is this an all-day event?
      ev.isAllDay = (item.gd$when[0].startTime.indexOf('T') === -1);
      
      events.push(ev);
    });
  
    // Sort events by date, ascending
    events.sort(function (a, b) {
      return b.date < a.date ? 1 : -1;
    });
  
    // Filter out any events that precede today
    var today = moment().startOf('day');
    var upcoming = $.grep(events, function(event, i) {
      return event.date.isAfter(today) || event.date.isSame(today);
    });
  
    // Output
    $.each(upcoming, function(i, event) {
      var el_title = $("<div>");
      el_title.addClass("event-title");
      el_title.text(event.title);
      
      var el_date = $("<div>");
      el_date.addClass("event-date");
      
      if (event.isAllDay)
        el_date.text(event.date.toJuliaString() + " all day");
      else
        el_date.text(event.date.toJuliaStringWithTime());
      
      var el_content = $("<div>");
      el_content.addClass("event-content");
      el_content.text(event.content);
      
      var el = $("<div>").append(el_title)
                         .append(el_date)
                         .append(el_content);
      el.addClass("event");
      target.append(el);
    });
  });
}
