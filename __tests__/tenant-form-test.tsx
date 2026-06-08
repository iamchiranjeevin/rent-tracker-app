import { fireEvent, render } from '@testing-library/react-native';

import { TenantForm } from '../src/components/TenantForm';

describe('<TenantForm />', () => {
  test('shows the combined reminder date-time picker control', async () => {
    const { getByTestId } = await render(
      <TenantForm
        tenant={null}
        visible
        onDismiss={jest.fn()}
        onSubmit={jest.fn()}
        onSubmitError={jest.fn()}
      />,
    );

    expect(getByTestId('tenant-reminder-picker')).toBeTruthy();
  });

  test('shows validation error when required fields are missing', async () => {
    const onSubmit = jest.fn();
    const onSubmitError = jest.fn();

    const { getByText } = await render(
      <TenantForm
        tenant={null}
        visible
        onDismiss={jest.fn()}
        onSubmit={onSubmit}
        onSubmitError={onSubmitError}
      />,
    );

    fireEvent.press(getByText('Save'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onSubmitError).toHaveBeenCalledWith('Tenant name is required.');
  });
});
