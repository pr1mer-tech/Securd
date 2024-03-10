interface State {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}
export type SetState = (state: State) => void;
