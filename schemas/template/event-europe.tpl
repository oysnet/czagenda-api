<div class="vevent">
      <span class="uid">{{meta.id}}</span>
      <img class="logo non-standard" src="{{event.logo}}" >
      <div class="summary">
        <h1>{{event.title}}</h1>
        <h2>{{event.subtitle}}</h2>
        <p>
          {{event.shortDescription}}
        </p>
      </div>
      <abbr class="dtstamp" title="{{meta.createDate}}">{{meta.createDate}}</abbr>
      <abbr class="last-modified" title="{{meta.updateDate}}">{{meta.updateDate}}</abbr>
      <abbr class="dtstart" title="{{event.startTime}}">{{event.startTime}}</abbr>
      <abbr class="dtent" title="{{event.endTime}}">{{event.endTime}}</abbr>
      <span class="category">{{event.category}}</span>
      <span class="status">{{event.eventStatus}}</span>
      <span class="language non-standard">{{event.languages[0]}}</span>
      <a class="url" href="{{event.website}}">{{event.website}}</a>
      <p class="description">
        {{event.content}}
      </p>
      <div class="location addr vcard">
        <img class="logo" src="{{event.place.logo}}">
        <span"fn org">
          {{event.place.name}}</a>
          <div class="geo">
            <span class="latitude">{{event.where[0].lat}}</span>
            <span class="longitude">{{event.where[0].lon}}</span>
          </div>
          <span class="street-address"> {{event.where[0].street}}</span>
          <span class="postal-code"> {{event.where[0].zipCode}}</span>
          <span class="locality"> {{event.where[0].city}}</span>
          <span class="region"> {{event.where[0].adminLevel3}}</span>
          <span class="country-name"> {{event.where[0].country}}</span>
          <span class="note">{{event.place.additionalInformations}}</span>
      </div>
      {%for w in who %}
      TDOD
      {% endfor %}{%for contact in contacts %}
      TDOD
      {% endfor %}
      <div class="tags non-standard">
        {% for tag in event.tags %} <span rel="tag">{{tag}}</span> {% endfor %}
      </div>
    </div>
    attendee
    contact
    organizer
    attach