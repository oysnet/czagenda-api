filters = require('jinjs/lib/filters');
filters['$iso8601ToDate'] = (function(){
      function $iso8601ToDate(str){
        return new Date(str);
      }
      return $iso8601ToDate;
    }())