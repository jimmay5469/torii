/**
 * This class implements authentication against an API
 * using the OAuth2 authorization flow in a popup window.
 */

import Endpoint from 'torii/endpoints/-base';
import Oauth2Authentication from 'torii/authentications/oauth2';
import {configurable} from 'torii/configuration';
import QueryString from 'torii/lib/query-string';
import requiredProperty from 'torii/lib/required-property';

function currentUrl(){
  return [window.location.protocol,
          "//",
          window.location.host,
          window.location.pathname].join('');
}

var Oauth2 = Endpoint.extend({
  concatenatedProperties: ['requiredUrlParams','optionalUrlParams'],

  // Default required url parameters.
  // Sub-classes can add additional ones
  requiredUrlParams: ['response_type', 'client_id', 'redirect_uri'],

  // Optional URL params can be added by sub-classes
  optionalUrlParams: ['scope'],

  // Required settings:
  baseUrl:      requiredProperty(),
  apiKey:       configurable('apiKey'),
  scope:        configurable('scope', null),
  clientId:     Ember.computed.alias('apiKey'),
  responseType: 'code',

  // API:

  redirectUri: function(){
    return currentUrl();
  }.property(),

  buildQueryString: function(){
    var requiredParams = this.get('requiredUrlParams'),
        optionalParams = this.get('optionalUrlParams');

    var qs = new QueryString(this, requiredParams, optionalParams);
    return qs.toString();
  },

  buildUrl: function(){
    var base = this.get('baseUrl'),
        qs   = this.buildQueryString();

    return [base, qs].join('?');
  },

  open: function(){
    var name = this.get('name'),
        url  = this.buildUrl();

    return this.get('popup').open(url).then(function(authData){
      return Oauth2Authentication.create({
        authorizationCode: authData.code,
        endpoint: name
      });
    });
  }

});

export default Oauth2;