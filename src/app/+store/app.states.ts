import { MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
// app
import * as fromApp from './+app/app.reducer';
import { AppEffects } from './+app/app.effects';

export interface State {
  [fromApp.FEATURE_KEY]: fromApp.State;
}

export const reducers = {
  [fromApp.FEATURE_KEY]: fromApp.reducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? []
  : [];

export const effects = [AppEffects];
