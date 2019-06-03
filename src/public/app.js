angular.module('Task', ['ngMaterial'])
  .config(($mdThemingProvider) => {
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('pink');
  })
  .filter('priority', () => (idx) =>
    ['Unknown', 'Too Low', 'Low', 'Medium', 'Hight', 'Too Hight'][idx])
  .component('taskCreator', {
    controllerAs: 'form',
    templateUrl: 'templates/task/addTask.html',
    controller: class TaskCreatorController {
      constructor($http, $rootScope, $timeout) {
        this.$http = $http;
        this.$timeout = $timeout;
        this.$rootScope = $rootScope;
        this.$rootScope.$on('edition', this.onEdit.bind(this));
        this.$rootScope.$on('refresh', this.refresh.bind(this));
        this.refresh();
      }

      refresh() {
        this.task = {
          name: 'Task name',
          priority: '3',
          dueDate: new Date()
        };
      }

      submit({ id, name, priority, dueDate }) {
        if (!name || !priority || !dueDate) return;
        const url = `/api/tasks${id ? `/${id}` : ''}`;
        const body = { name, priority, dueDate, };

        this.$http.post(url, body)
          .then(msg => this.$rootScope.$emit('changed', msg))
          .catch(error => console.log(error))
      }

      onEdit(_, task) {
        this.task = task;
      }
    }
  })
  .component('taskList', {
    controllerAs: 'form',
    templateUrl: 'templates/task/taskList.html',
    controller: class TaskListController {
      constructor($http, $timeout, $rootScope) {
        this.$http = $http;
        this.$timeout = $timeout;
        this.$rootScope = $rootScope;
        this.tasks = [];
        this.paint();
        this.$rootScope.$on('changed', () => this.paint());
      }

      paint() {
        this.$http.get(`/api/tasks?ts=${new Date().getTime()}`)
          .then((res) => this.refresh(res))
          .catch(error => console.log(error));
      }

      refresh({ data }) {
        this.$timeout(() => this.tasks = data.map(([_, item]) => {
          console.log(item);
          return item;
        }));
      }

      destroy(id) {
        this.$rootScope.$emit('refresh');
        this.$http.delete(`/api/tasks/${id}`)
          .then(() => this.paint())
          .catch(error => console.log(error));
      }

      edit(task) {
        this.$rootScope.$emit('edition', angular.copy(task));
      }

    }
  });