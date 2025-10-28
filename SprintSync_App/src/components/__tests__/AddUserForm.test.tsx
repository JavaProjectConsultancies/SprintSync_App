import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddUserForm from '../AddUserForm';

// Mock the hooks
jest.mock('../../hooks/api/useUsers', () => ({
  useCreateUser: () => ({
    mutate: jest.fn().mockResolvedValue({}),
    loading: false,
    error: null
  })
}));

jest.mock('../../hooks/api/useDepartments', () => ({
  useDepartments: () => ({
    data: [
      { id: '1', name: 'Engineering', description: 'Engineering Department' },
      { id: '2', name: 'Marketing', description: 'Marketing Department' }
    ],
    loading: false,
    error: null
  })
}));

jest.mock('../../hooks/api/useDomains', () => ({
  useDomains: () => ({
    data: [
      { id: '1', name: 'Frontend', description: 'Frontend Development' },
      { id: '2', name: 'Backend', description: 'Backend Development' }
    ],
    loading: false,
    error: null
  })
}));

jest.mock('../../hooks/api/useExperienceLevels', () => ({
  useExperienceLevels: () => ({
    experienceLevels: [
      { value: 'junior', label: 'Junior' },
      { value: 'mid', label: 'Mid-level' },
      { value: 'senior', label: 'Senior' },
      { value: 'lead', label: 'Lead' }
    ],
    loading: false,
    error: null
  })
}));

describe('AddUserForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Add New User')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Password *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument();
    expect(screen.getByLabelText('Role *')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const emailInput = screen.getByLabelText('Email Address *');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const passwordInput = screen.getByLabelText('Password *');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters with uppercase, lowercase, and number')).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('validates hourly rate format', async () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const hourlyRateInput = screen.getByLabelText('Hourly Rate ($)');
    fireEvent.change(hourlyRateInput, { target: { value: '-50' } });

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Hourly rate must be a positive number')).toBeInTheDocument();
    });
  });

  it('validates availability percentage range', async () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const availabilityInput = screen.getByLabelText('Availability (%)');
    fireEvent.change(availabilityInput, { target: { value: '150' } });

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Availability must be between 0 and 100')).toBeInTheDocument();
    });
  });

  it('validates avatar URL format', async () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const avatarInput = screen.getByLabelText('Avatar URL');
    fireEvent.change(avatarInput, { target: { value: 'not-a-valid-url' } });

    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid image URL')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows password visibility toggle', () => {
    render(
      <AddUserForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const passwordInput = screen.getByLabelText('Password *');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getAllByRole('button').find(button => 
      button.querySelector('svg') && button.querySelector('svg')?.getAttribute('data-lucide') === 'eye'
    );
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
