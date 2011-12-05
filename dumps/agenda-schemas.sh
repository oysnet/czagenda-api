curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fgeo-abstract -d '{"type":"schema","schema":{"type":"object","description":"Localization coordinates","properties":{"lat":{"type":"number","required":true},"lon":{"type":"number","required":true}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"geo","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:53:56.912Z","updateDate":"2011-11-17T09:53:56.912Z","hash":"cb036f5d106536ded39f2380d05c2898"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Forganization-abstract -d '{"type":"schema","schema":{"description":"Organization","type":"object","extends":{"$ref":"/schema/entity-abstract"},"properties":{"type":{"description":"Extensible enum","type":"string","enum":["organization"]},"name":{"description":"Name of the organization.","type":"string","required":true}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"organization","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:18.074Z","updateDate":"2011-11-17T09:56:18.074Z","hash":"a2b78311ca5981ab1c2550eb91601b04"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fwho-abstract -d '{"type":"schema","schema":{"description":"An entity associated with the containing entity. The type of the association is determined by the rel attribute.","type":"object","properties":{"rel":{"description":"Specifies the relationship between the containing entity and the contained entity. ","type":"string","required":false,"enum":["attendee","organizer","performer","speaker","partner"]},"href":{"description":"Id of the entity","type":"string","required":true,"pattern":"^\\/entity\\/[0-9a-z]+$"},"valueString":{"description":"A simple string value that can be used as a representation of this entity.","type":"string","required":false}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"who","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:53:50.869Z","updateDate":"2011-11-17T09:53:50.869Z","hash":"15d3102228d3f9c09fa004c3e8b8cade"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fwho -d '{"type":"schema","schema":{"description":"A person associated with the containing entity. The type of the association is determined by the rel attribute; the details about the person are contained in an embedded or linked-to Contact entry.","type":"object","extends":{"$ref":"/schema/who-abstract"},"additionalProperties":false},"final":true,"sample":null,"template":null,"status":"APPROVED","name":"who","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:53:53.893Z","updateDate":"2011-11-17T09:53:53.893Z","hash":"0581db2df237688795aba7acc44a462a"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Flocalization-abstract -d '{"type":"schema","schema":{"type":"object","description":"Localization description","properties":{"city":{"type":"string","required":false},"country":{"type":"string","required":false},"street":{"description":"Street number and street","type":"string","required":false},"zipCode":{"type":"string","required":false},"adminLevel1":{"description":"Administrative level such as region, state, etc...","type":"string","required":false},"adminLevel2":{"description":"Administrative level such as department, metropolitan area, etc...","type":"string","required":false},"geoPt":{"$ref":"/schema/geo","required":false},"valueString":{"description":"A simple string value that can be used as a representation of this localization.","type":"string","required":false}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"localization","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:54:02.948Z","updateDate":"2011-11-17T09:54:02.948Z","hash":"8cab473ed0d586b917496903c901b750"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Flocalization -d '{"type":"schema","schema":{"type":"object","description":"Localization description","extends":{"$ref":"/schema/localization-abstract"},"additionalProperties":false},"final":true,"sample":null,"template":null,"status":"APPROVED","name":"localization","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:54:05.983Z","updateDate":"2011-11-17T09:54:05.983Z","hash":"a396ba556ce8488909b647de2c462451"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fentity-abstract -d '{"type":"schema","schema":{"description":"Abstract Entity","type":"object","extends":{"$ref":"/schema/base-abstract"},"properties":{"type":{"description":"Extensible enum","type":"string","required":true},"where":{"description":"Location of the event","type":"array","required":true,"minItems":1,"items":{"$ref":"/schema/localization"}},"websites":{"type":"array","minItems":1,"required":false,"items":{"type":[{"type":"string","description":"A link to a website about the entity","pattern":"^http:\\/\\/.+$"}]}}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"entity","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:15.029Z","updateDate":"2011-11-17T09:56:15.029Z","hash":"3b51cb3e418a60958ed15ee29d17baad"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fevent-europe -d '{"type":"schema","schema":{"description":"Event","type":"object","extends":{"$ref":"/schema/event-europe-abstract"},"additionalProperties":false},"final":true,"sample":null,"template":null,"status":"APPROVED","name":"event-europe","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:33.282Z","updateDate":"2011-11-17T09:56:33.282Z","hash":"c9d6fa51757225c82822309eac6e9d6e"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fbase-abstract -d '{"type":"schema","schema":{"description":"Base schema","type":"object","properties":{"links":{"type":"array","minLength":1,"items":[{"description":"Link to the schema that describe the instance","href":{"type":"string","required":true},"rel":{"value":"describedby","required":true},"required":true}]}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"base","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:53:47.845Z","updateDate":"2011-11-17T09:53:47.845Z","hash":"b5b189a602ce7ffd6d19b7f48941ba33"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fevent-abstract -d '{"type":"schema","schema":{"description":"Event","type":"object","extends":{"$ref":"/schema/base-abstract"},"properties":{"content":{"description":"Longer description of the event.","type":"string","required":false},"title":{"description":"Brief title for the event.","type":"string","required":true},"eventStatus":{"description":"The event status","type":"string","enum":["canceled","confirmed","tentative"],"required":true},"languages":{"description":"ISO 639-2 language code","type":"array","required":false,"minItems":1,"items":{"type":[{"type":"string","maxLength":3,"minLength":3}]}},"logo":{"description":"An URL to a logo for the event","type":"string","required":false,"pattern":"^http:\\/\\/.+$"},"website":{"description":"A link to a website about the event","required":false,"type":"string","pattern":"^http:\\/\\/.+$"},"childEvents":{"description":"List of sub events if the current event is a master event","type":"array","required":false,"minItems":1,"items":{"type":[{"type":"string","pattern":"^\\/event\\/[0-9a-z]+$"}]}},"parentEvent":{"description":"The master event if the current event is a sub event","type":"string","pattern":"^\\/event\\/[0-9a-z]+$","required":false},"childSchema":{"description":"Id of the schema of which all sub events schema must inherit from","type":"string","pattern":"^\\/schema\\/.+$","required":false},"tags":{"type":"array","required":false,"minItems":1,"items":{"type":[{"type":"string","maxLength":128}]}},"category":{"description":"Id of the category","type":"string","required":true,"pattern":"^\\/category\\/[0-9a-z]+$"},"when":{"description":"Event time. The startTime and endTime attributes must both be set, although for all-day events those attributes are only dates, with no times.","type":"array","required":true,"minItems":1,"items":{"type":[{"type":"object","additionalProperties":false,"properties":{"startTime":{"description":"Describes when the event starts or (for zero-duration events) when it occurs. If the timezone is not specified, the observer local timezone is assumed.","type":"string","required":true,"format":"date"},"endTime":{"description":"Describes when the event ends. If the timezone is not specified, the observer local timezone is assumed.","type":"string","format":"date","required":false},"valueString":{"description":"A simple string value that can be used as a representation of this time period.","type":"string","required":false}}},{"type":"object","additionalProperties":false,"properties":{"startTime":{"description":"Describes when the event starts or (for zero-duration events) when it occurs. If the timezone is not specified, the observer local timezone is assumed.","type":"string","required":true,"format":"date-time"},"endTime":{"description":"Describes when the event ends. If the timezone is not specified, the observer local timezone is assumed.","type":"string","format":"date-time","required":false},"valueString":{"description":"A simple string value that can be used as a representation of this time period.","type":"string","required":false}}}]}},"where":{"description":"Location of the event","type":"array","required":false,"minItems":1,"items":{"$ref":"/schema/localization"}},"who":{"type":"array","required":false,"minItems":1,"items":{"type":[{"$ref":"/schema/who"}]}},"contacts":{"type":"array","required":false,"minItems":1,"items":{"type":[{"description":"An entity associated with the containing entity. The type of the association is determined by the rel attribute.","type":"object","properties":{"rel":{"description":"Specifies the kind of contact","type":"string","required":true,"enum":["registration","information","press"]},"link":{"type":"string","required":false,"pattern":"^http:\\/\\/.+$"},"email":{"type":"string","required":false,"pattern":"^[a-z0-9._-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"},"phone":{"type":"string","required":false},"fax":{"type":"string","required":false},"additionalInformations":{"type":"string","required":false}}}]}}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"event","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:08.819Z","updateDate":"2011-11-17T09:56:08.819Z","hash":"e056f76284e3455a4262a73514cc4e7c"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Forganization -d '{"type":"schema","schema":{"description":"Organization","type":"object","extends":{"$ref":"/schema/organization-abstract"},"additionalProperties":false},"final":true,"sample":null,"template":null,"status":"APPROVED","name":"organization","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:21.099Z","updateDate":"2011-11-17T09:56:21.099Z","hash":"ed72cb72a693ac625ef0067bf0808950"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fperson-abstract -d '{"type":"schema","schema":{"description":"Abstract Person","type":"object","extends":{"$ref":"/schema/entity-abstract"},"properties":{"type":{"description":"Extensible enum","type":"string","enum":["person"]},"title":{"description":"Courtesy","type":"string","enum":["Mr.","Ms.","Miss","Mrs."]},"firstName":{"description":"Firstname.","type":"string","required":true},"lastName":{"description":"Firstname.","type":"string","required":true}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"person","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:24.119Z","updateDate":"2011-11-17T09:56:24.119Z","hash":"259f01afb9db1671f7d6462180c44017"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fperson -d '{"type":"schema","schema":{"description":"Person","type":"object","extends":{"$ref":"/schema/person-abstract"},"additionalProperties":false},"final":true,"sample":null,"template":null,"status":"APPROVED","name":"person","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:27.149Z","updateDate":"2011-11-17T09:56:27.149Z","hash":"ec157cc8c426b7297b6f5ce064c01381"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fevent-europe-abstract -d '{"type":"schema","schema":{"description":"Event","type":"object","extends":{"$ref":"/schema/event-abstract"},"properties":{"subtitle":{"type":"string","required":false},"shortDescription":{"type":"string","required":false},"place":{"description":"Additional informations about the event location","type":"object","required":false,"properties":{"name":{"type":"string","required":true},"logo":{"type":"string","required":false},"additionalInformations":{"type":"string","required":false}}},"where":{"description":"Location of the event","type":"array","required":false,"minItems":1,"maxItems":1,"items":{"$ref":"/schema/localization"}}}},"final":false,"sample":null,"template":null,"status":"APPROVED","name":"event-europe","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:30.166Z","updateDate":"2011-11-17T09:56:30.166Z","hash":"ffc7d14407f4297ba4bc71e7049f06f3"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fevent -d '{"type":"schema","schema":{"description":"Event","type":"object","extends":{"$ref":"/schema/event-abstract"},"additionalProperties":false},"final":true,"sample":null,"template":null,"status":"APPROVED","name":"event","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:56:12.012Z","updateDate":"2011-11-17T09:56:12.012Z","hash":"6546e48081aab58159297e432bab53ac"}';
curl -XPUT http://10.7.50.110:9200/agenda/schema/%2Fschema%2Fgeo -d '{"type":"schema","schema":{"type":"object","description":"Localization coordinates","extends":{"$ref":"/schema/geo-abstract"},"additionalProperties":false},"final":true,"sample":null,"template":null,"status":"APPROVED","name":"geo","description":null,"author":"/user/jh.pinson","createDate":"2011-11-17T09:53:59.930Z","updateDate":"2011-11-17T09:53:59.930Z","hash":"bb762cef7a999baac98d5313bd474f9b"}';