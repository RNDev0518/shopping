import type, { NavigationActions, StackActions, NavigationParams, NavigationRoute } from 'react-navigation';

let container = null, switchContainer = null;

function setContainer(_container: Object) {
  container = _container;
}

function setSwitchContainer(_container: Object) {
  switchContainer = _container;
}

function navigateSwitch(routeName: string, params?: NavigationParams) {
  switchContainer.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
}

function navigate(routeName: string, params?: NavigationParams) {
  container.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
}

function navigateDeep(actions: { routeName: string, params?: NavigationParams }[]) {
  container.dispatch(
    actions.reduceRight(
      (prevAction, action): any =>
        NavigationActions.navigate({
          routeName: action.routeName,
          params: action.params,
          action: prevAction,
        }),
      undefined,
    ),
  );
}

function getCurrentRoute(): NavigationRoute | null {
  if (!container || !container.state.nav) return null;

  let route = container.state.nav;
	while(route.routes) route = route.routes[route.index];
  return route.routeName;
}

export const NavigationService = {
  setContainer,
  setSwitchContainer,
  navigateSwitch,
  navigateDeep,
  navigate,
  getCurrentRoute,
};
