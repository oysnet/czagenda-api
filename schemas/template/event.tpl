<div class="vevent">
  <span class="uid">{{meta.id}}</span>
  {% if event.logo %}
  <img class="logo non-standard" src="{{event.logo}}" >
  {% endif %}
  <div class="summary">
    <abbr class="dtstart" title="{{event.startTime}}">{{event.when[0].startTime|iso8601ToDate()|date("%x %H:%m")}}</abbr>
    <h1>{{event.title}}</h1>
  </div>
  <abbr class="dtstamp" title="{{meta.createDate}}">{{meta.createDate}}</abbr>
  <abbr class="last-modified" title="{{meta.updateDate}}">{{meta.updateDate}}</abbr>
  <span class="category">{{event.category}}</span>
  <span class="status">{{event.eventStatus}}</span>
  
  <p class="description">{{event.content}}</p>
  
</div>