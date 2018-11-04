<p align="center">
  <img height="256px" width="256px" style="text-align: center;" src="https://cdn.rawgit.com/pfbrowning/ng-loading-indicator/master/src/assets/logo.svg">
</p>

# OIDC Test Client - A small OpenID Connect implicit flow testing & diagnostics application 

[![Build Status](https://travis-ci.org/pfbrowning/oidc-test-client.svg?branch=master)](https://travis-ci.org/pfbrowning/oidc-test-client)
[![Coverage Status](https://coveralls.io/repos/github/pfbrowning/oidc-test-client/badge.svg?branch=master)](https://coveralls.io/github/pfbrowning/oidc-test-client?branch=master)

# Introduction

OIDC Test Client is a small Angular SPA which utilizes [angular-oauth2-oidc](https://www.npmjs.com/package/angular-oauth2-oidc) to easily test integration with OpenID Connect providers via implicit flow out-of-the-box with minimal configuration overhead.  It's been tested with IdentityServer4, but it's expected to work with any other OpenID Connect providers which support implicit flow.

![](screenshot.png?raw=true)

# Features
* Displays the claims provided in the access token and id token
* Displays the expiration date, status (is it currently expired?), and seconds to (or from) expiration for both the id token and the access token
* Counts down to expiration in real time by updating seconds to expiration each second
* Performs [automatic silent refresh](https://manfredsteyer.github.io/angular-oauth2-oidc/docs/additional-documentation/refreshing-a-token-(silent-refresh).html)
* Allows the user to explicitly invoke silent refresh at the push of a button for troubleshooting and demonstration
* Displays OAuthEvents emitted from angular-oauth2-oidc as toaster notifications

# Setup
1. Perform any necessary server-side configuration within your OpenID Connect provider, such as configuring the client, if you haven't already done so.
2. Clone the git repo.
3. Perform the usual `npm i` to install dependencies.
4. Provide the configuration details for your OIDC provider in `/src/app/config/auth.config.ts`, or leave it as-is if you're working with a local instance of [identityserver4-quicker-quickstart](https://github.com/pfbrowning/identityserver4-quicker-quickstart).  This is the AuthConfig defined by [angular-oauth2-oidc](https://www.npmjs.com/package/angular-oauth2-oidc).
4. Ensure that your OpenID Connect provider is running and accessible (for example, that your debug server is running if you're debugging locally).
5. Run `ng serve --open` to run locally and automatically open the app in your browser.  You should be greeted with a "Log In" button.

# Troubleshooting
If you're having trouble integrating with an OpenID Connect provider, I would suggest first running OIDC Test Client alongside a local instance of 
[identityserver4-quicker-quickstart](https://github.com/pfbrowning/identityserver4-quicker-quickstart).  OIDC Test Client is already configured to work with a locally running instance of the quicker-quickstart project out-of-the-box with no extra configuration needed.  Once you've confirmed that it's working with quicker-quickstart, looking for differences between that implementation and the one that you're having trouble with might aid you in finding a solution.