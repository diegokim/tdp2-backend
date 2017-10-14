// eslint-disable-next-line
const app = angular.module('LinkUp', []);
app.controller('Controller', ($scope, $http) => { // eslint-disable-line

  // variables
  $scope.denounces = {};

  // denounces
  $scope.getDenounces = () => {
    // $http.get("/users") TOD0: PARA PEDIR POR API
    // .then((response) => {
    //   console.log(response.data);
    //   $scope.user = response.data.users;
    // });
    $scope.denounces = [{
      id:             'ID',
      name:           'Pedro',
      denouncedName:  'Juan'
    }]
  };
});
