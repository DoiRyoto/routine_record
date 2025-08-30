import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import SignUpPageImproved from './SignUpPageImproved';

// Mock useAuth
const mockSignUp = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('SignUpPage', () => {
  beforeEach(() => {
    mockSignUp.mockClear();
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<SignUpPageImproved />);
      
      expect(screen.getByRole('heading', { name: 'アカウント登録' })).toBeInTheDocument();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード確認')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'アカウント登録' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'こちらからサインイン' })).toHaveAttribute('href', '/auth/signin');
    });

    it('shows password requirements help text', () => {
      render(<SignUpPageImproved />);
      
      expect(screen.getByText('大文字、小文字、数字を含む6文字以上で入力してください')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<SignUpPageImproved />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('アカウント登録');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(<SignUpPageImproved />);
      
      const submitButton = screen.getByRole('button', { name: 'アカウント登録' });
      expect(submitButton).toBeDisabled(); // Disabled due to validation
      
      // Try to submit without filling fields
      await user.click(screen.getByLabelText('メールアドレス'));
      await user.tab(); // Move to next field
      
      await waitFor(() => {
        expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      });
    });

    it('shows validation error for weak password', async () => {
      const user = userEvent.setup();
      render(<SignUpPageImproved />);
      
      const passwordInput = screen.getByLabelText('パスワード');
      await user.type(passwordInput, 'weakpass');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('パスワードは大文字、小文字、数字を含む必要があります')).toBeInTheDocument();
      });
    });

    it('shows validation error for password mismatch', async () => {
      const user = userEvent.setup();
      render(<SignUpPageImproved />);
      
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'DifferentPass1');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
      });
    });

    it('enables submit button when form is valid', async () => {
      const user = userEvent.setup();
      render(<SignUpPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      const submitButton = screen.getByRole('button', { name: 'アカウント登録' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'StrongPass1');
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls signUp with correct data on form submission', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      
      render(<SignUpPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      const submitButton = screen.getByRole('button', { name: 'アカウント登録' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'StrongPass1');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'StrongPass1');
      });
    });

    it('displays error message when sign up fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      mockSignUp.mockResolvedValue({ error: { message: errorMessage } });
      
      render(<SignUpPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      const submitButton = screen.getByRole('button', { name: 'アカウント登録' });
      
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'StrongPass1');
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveTextContent(errorMessage);
      });
    });

    it('shows success screen after successful registration', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      
      render(<SignUpPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      const submitButton = screen.getByRole('button', { name: 'アカウント登録' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'StrongPass1');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '登録完了' })).toBeInTheDocument();
        expect(screen.getByText('確認メールを送信しました。')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'サインインページへ' })).toHaveAttribute('href', '/auth/signin');
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
      
      render(<SignUpPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      const submitButton = screen.getByRole('button', { name: 'アカウント登録' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'StrongPass1');
      await user.click(submitButton);
      
      // Check loading state
      expect(screen.getByText('登録中...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '登録完了' })).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SignUpPageImproved />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations on success screen', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      const user = userEvent.setup();
      
      render(<SignUpPageImproved />);
      
      // Fill and submit form
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'StrongPass1');
      await user.click(screen.getByRole('button', { name: 'アカウント登録' }));
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '登録完了' })).toBeInTheDocument();
      });
      
      const { container } = render(<SignUpPageImproved />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(<SignUpPageImproved />);
      
      const passwordInput = screen.getByLabelText('パスワード');
      const helpText = screen.getByText('大文字、小文字、数字を含む6文字以上で入力してください');
      
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-help');
      expect(helpText).toHaveAttribute('id', 'password-help');
    });

    it('updates aria-invalid when validation fails', async () => {
      const user = userEvent.setup();
      render(<SignUpPageImproved />);
      
      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード確認');
      
      await user.type(passwordInput, 'StrongPass1');
      await user.type(confirmPasswordInput, 'DifferentPass1');
      await user.tab();
      
      await waitFor(() => {
        expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
        expect(confirmPasswordInput).toHaveAttribute('aria-describedby', 'confirm-password-error');
      });
    });
  });

  describe('Responsive Design', () => {
    it('has responsive container classes', () => {
      const { container } = render(<SignUpPageImproved />);
      
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });
});