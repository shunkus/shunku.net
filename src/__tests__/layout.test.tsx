import { render } from '@testing-library/react';
import App from '../pages/_app';
import type { AppProps } from 'next/app';

describe('App Component', () => {
  it('renders children correctly', () => {
    const TestComponent = () => <div data-testid="test-child">Test Content</div>;
    
    const mockPageProps = {};
    const appProps: AppProps = {
      Component: TestComponent,
      pageProps: mockPageProps,
      router: {} as any,
    };
    
    const { getByTestId } = render(<App {...appProps} />);
    
    expect(getByTestId('test-child')).toBeInTheDocument();
    expect(getByTestId('test-child')).toHaveTextContent('Test Content');
  });

  it('applies font variables correctly', () => {
    const TestComponent = () => <div data-testid="test-component">Test</div>;
    
    const mockPageProps = {};
    const appProps: AppProps = {
      Component: TestComponent,
      pageProps: mockPageProps,
      router: {} as any,
    };
    
    const { container } = render(<App {...appProps} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('antialiased');
  });
});