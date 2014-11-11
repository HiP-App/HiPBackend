
dependencies = [
    'ngRoute',
    'ui.bootstrap',
    'myApp.filters',
    'myApp.services',
    'myApp.controllers',
    'myApp.directives',
    'myApp.common',
    'myApp.routeConfig'
]

app = angular.module('myApp', dependencies)

angular.module('myApp.routeConfig', ['ngRoute'])
    .config ($routeProvider, $locationProvider) ->
        #$locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: '/assets/partials/hipsupervisor.html'
            })
            .when('/group/create', {
                templateUrl: '/assets/partials/createGroup.html'
            })
            .when('/topic/create', {
                templateUrl: '/assets/partials/createTopic.html'
            })
            .when('/group/propose', {
              templateUrl: '/assets/partials/proposetopic.html'
            })
            .when('/group/view/:uID', {
                templateUrl: '/assets/partials/groupview.html'
            })
            .when('/language/create', {
              templateUrl: '/assets/partials/createLangTerm.html'
            })
            .when('/messages/all/:recName', {
             templateUrl: '/assets/partials/messages.html'
            })
            .when('/messages/view/:messageID', {
              templateUrl: '/assets/partials/messagesdetails.html'
            })
            .otherwise({redirectTo: '/'})

@commonModule = angular.module('myApp.common', [])
@controllersModule = angular.module('myApp.controllers', [])
@servicesModule = angular.module('myApp.services', [])
@modelsModule = angular.module('myApp.models', [])
@directivesModule = angular.module('myApp.directives', [])
@filtersModule = angular.module('myApp.filters', [])