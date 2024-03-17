export type CollateralPipelineState = {
    buttonEnabled: boolean;
    buttonLabel: string;
    buttonLoading: boolean;
};

export const lockPipelineState: CollateralPipelineState = {
    buttonEnabled: false,
    buttonLabel: 'Approve',
    buttonLoading: false,
};

export const withdrawPipelineState: CollateralPipelineState = {
    buttonEnabled: false,
    buttonLabel: 'Withdraw',
    buttonLoading: false,
};

export const borrowPipelineState: CollateralPipelineState = {
    buttonEnabled: false,
    buttonLabel: 'Borrow',
    buttonLoading: false,
};

export const repayPipelineState: CollateralPipelineState = {
    buttonEnabled: false,
    buttonLabel: 'Approve',
    buttonLoading: false,
};

export const leveragePipelineState: CollateralPipelineState = {
    buttonEnabled: false,
    buttonLabel: 'Apply Leverage',
    buttonLoading: false,
};