
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
                templateUrl: '/assets/partials/index.html'
            })
            .when('/myhip', {
                templateUrl: '/assets/partials/basic_supervisorView.html'
            })
            .when('/contact', {
                templateUrl: '/assets/partials/basic_contact.html'
            })
            .when('/group/create', {
                templateUrl: '/assets/partials/myhip_createGroup.html'
            })
            .when('/topic/create', {
                templateUrl: '/assets/partials/myhip_createTopic.html'
            })
            .when('/group/propose', {
              templateUrl: '/assets/partials/group_proposeTopic.html'
            })
            .when('/group/view/:uID', {
                templateUrl: '/assets/partials/basic_groupView.html'
            })
            .when('/language/create', {
              templateUrl: '/assets/partials/admin_createLangTerm.html'
            })
            .when('/messages/all/:recName', {
             templateUrl: '/assets/partials/basic_messages.html'
            })
            .when('/messages/view/:messageID', {
              templateUrl: '/assets/partials/basic_messagesDetails.html'
            })
            .otherwise({redirectTo: '/'})

@commonModule = angular.module('myApp.common', [])
@controllersModule = angular.module('myApp.controllers', [])
@servicesModule = angular.module('myApp.services', [])
@modelsModule = angular.module('myApp.models', [])
@directivesModule = angular.module('myApp.directives', [])
@filtersModule = angular.module('myApp.filters', [])