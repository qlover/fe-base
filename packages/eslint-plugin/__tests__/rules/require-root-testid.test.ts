import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  requireRootTestid as rule,
  RULE_NAME
} from '../../src/rules/require-root-testid';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    }
  }
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Component with testid
    {
      code: `
        function Component() {
          return <div data-testid="Component">Content</div>;
        }
      `
    },
    // Arrow function component with testid
    {
      code: `
        const ArrowComponent = () => {
          return <div data-testid="ArrowComponent">Content</div>;
        }
      `
    },
    // Component with testid and other attributes
    {
      code: `
        function Component() {
          return <div data-testid="Component" className="test">Content</div>;
        }
      `
    },
    // Component with testid after other attributes
    {
      code: `
        function Component() {
          return <div className="test" data-testid="Component">Content</div>;
        }
      `
    },
    // Nested component (only root element needs testid)
    {
      code: `
        function Parent() {
          return (
            <div data-testid="Parent">
              <Child />
            </div>
          );
        }
        function Child() {
          return <span data-testid="Child">Child content</span>;
        }
      `
    },
    // Context provider JSX element excluded with custom exclude option
    {
      code: `
        function App() {
          return <ConfigProvider>Content</ConfigProvider>;
        }
      `,
      options: [
        {
          exclude: ['ConfigProvider']
        }
      ]
    },
    {
      code: `
        function App() {
          return <ThemeProvider>Content</ThemeProvider>;
        }
      `,
      options: [
        {
          exclude: ['ThemeProvider']
        }
      ]
    },
    {
      code: `
        function App() {
          return <IOCProvider>Content</IOCProvider>;
        }
      `,
      options: [
        {
          exclude: ['IOCProvider']
        }
      ]
    },
    // JSXMemberExpression context provider
    {
      code: `
        function App() {
          return <Antd.ConfigProvider>Content</Antd.ConfigProvider>;
        }
      `,
      options: [
        {
          exclude: ['ConfigProvider']
        }
      ]
    },
    // Custom exclude with array - JSX element name
    {
      code: `
        function App() {
          return <CustomProvider>Content</CustomProvider>;
        }
      `,
      options: [
        {
          exclude: ['CustomProvider']
        }
      ]
    },
    // Custom exclude with regex pattern (string) - JSX element name
    {
      code: `
        function App() {
          return <MyProvider>Content</MyProvider>;
        }
      `,
      options: [
        {
          exclude: ['/Provider$/']
        }
      ]
    },
    // Multiple exclusions - JSX element names
    {
      code: `
        function App() {
          return (
            <>
              <Wrapper>Content</Wrapper>
              <Container>Content</Container>
            </>
          );
        }
      `,
      options: [
        {
          exclude: ['Wrapper', 'Container']
        }
      ]
    },
    // JSX element name ends with excluded string
    {
      code: `
        function App() {
          return <MyConfigProvider>Content</MyConfigProvider>;
        }
      `,
      options: [
        {
          exclude: ['Provider']
        }
      ]
    },
    // Non-root JSX element (should not require testid)
    {
      code: `
        function Component() {
          return (
            <div data-testid="Component">
              <span>No testid needed</span>
            </div>
          );
        }
      `
    },
    // Fragment as root (not a JSXElement, should not trigger)
    {
      code: `
        function Component() {
          return <>Content</>;
        }
      `
    },
    // Component with multiple root elements (each needs testid)
    {
      code: `
        function Component() {
          return (
            <>
              <div data-testid="Component-1">First</div>
              <div data-testid="Component-2">Second</div>
            </>
          );
        }
      `
    },
    // Exclude div tag
    {
      code: `
        function DivComponent() {
          return <div>Content</div>;
        }
      `,
      options: [
        {
          exclude: ['div']
        }
      ]
    },
    // Exclude multiple HTML tags
    {
      code: `
        function MultiTagComponent() {
          return <div>Content</div>;
        }
      `,
      options: [
        {
          exclude: ['div', 'span', 'p']
        }
      ]
    },
    {
      code: `
        function SpanComponent() {
          return <span>Content</span>;
        }
      `,
      options: [
        {
          exclude: ['div', 'span', 'p']
        }
      ]
    },
    {
      code: `
        function PComponent() {
          return <p>Content</p>;
        }
      `,
      options: [
        {
          exclude: ['div', 'span', 'p']
        }
      ]
    },
    // Exclude HTML tags using regex
    {
      code: `
        function RegexDivComponent() {
          return <div>Content</div>;
        }
      `,
      options: [
        {
          exclude: [
            '/^(div|span|p|section|article|header|footer|nav|main|aside)$/'
          ]
        }
      ]
    },
    {
      code: `
        function SectionComponent() {
          return <section>Content</section>;
        }
      `,
      options: [
        {
          exclude: [
            '/^(div|span|p|section|article|header|footer|nav|main|aside)$/'
          ]
        }
      ]
    },
    {
      code: `
        function ArticleComponent() {
          return <article>Content</article>;
        }
      `,
      options: [
        {
          exclude: [
            '/^(div|span|p|section|article|header|footer|nav|main|aside)$/'
          ]
        }
      ]
    },
    // Exclude HTML tags but not custom components
    {
      code: `
        function ExcludeDivComponent() {
          return <div>Content</div>;
        }
      `,
      options: [
        {
          exclude: ['div']
        }
      ]
    }
  ],
  invalid: [
    // Missing testid - function declaration
    {
      code: `
        function Component() {
          return <div>Content</div>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function Component() {
          return <div data-testid="Component">Content</div>;
        }
      `
    },
    // Missing testid - arrow function
    {
      code: `
        const ArrowComponent = () => {
          return <div>Content</div>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        const ArrowComponent = () => {
          return <div data-testid="ArrowComponent">Content</div>;
        }
      `
    },
    // Missing testid with existing attributes
    {
      code: `
        function Component() {
          return <div className="test">Content</div>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function Component() {
          return <div data-testid="Component" className="test">Content</div>;
        }
      `
    },
    // Missing testid - component function name is ConfigProvider but JSX element is div (should require testid)
    {
      code: `
        function ConfigProvider() {
          return <div>Provider content</div>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function ConfigProvider() {
          return <div data-testid="ConfigProvider">Provider content</div>;
        }
      `
    },
    // Missing testid - nested component
    {
      code: `
        function Parent() {
          return (
            <div data-testid="Parent">
              <Child />
            </div>
          );
        }
        function Child() {
          return <span>Child content</span>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function Parent() {
          return (
            <div data-testid="Parent">
              <Child />
            </div>
          );
        }
        function Child() {
          return <span data-testid="Child">Child content</span>;
        }
      `
    },
    // Missing testid - JSXMemberExpression
    {
      code: `
        function Component() {
          return <Antd.Button>Click me</Antd.Button>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function Component() {
          return <Antd.Button data-testid="Component">Click me</Antd.Button>;
        }
      `
    },
    // Missing testid - ConfigProvider (no longer excluded by default)
    {
      code: `
        function App() {
          return <ConfigProvider>Content</ConfigProvider>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function App() {
          return <ConfigProvider data-testid="App">Content</ConfigProvider>;
        }
      `
    },
    // Missing testid - ThemeProvider (no longer excluded by default)
    {
      code: `
        function App() {
          return <ThemeProvider>Content</ThemeProvider>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function App() {
          return <ThemeProvider data-testid="App">Content</ThemeProvider>;
        }
      `
    },
    // Missing testid - IOCProvider (no longer excluded by default)
    {
      code: `
        function App() {
          return <IOCProvider>Content</IOCProvider>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function App() {
          return <IOCProvider data-testid="App">Content</IOCProvider>;
        }
      `
    },
    // Missing testid - Antd.ConfigProvider (no longer excluded by default)
    {
      code: `
        function App() {
          return <Antd.ConfigProvider>Content</Antd.ConfigProvider>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function App() {
          return <Antd.ConfigProvider data-testid="App">Content</Antd.ConfigProvider>;
        }
      `
    },
    // Missing testid - MyConfigProvider (no longer excluded by default)
    {
      code: `
        function App() {
          return <MyConfigProvider>Content</MyConfigProvider>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function App() {
          return <MyConfigProvider data-testid="App">Content</MyConfigProvider>;
        }
      `
    },
    // Missing testid - component without name (fallback to 'component')
    {
      code: `
        const Component = () => <div>Content</div>;
      `,
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        const Component = () => <div data-testid="Component">Content</div>;
      `
    },
    // Custom exclude - component not in exclude list
    {
      code: `
        function RegularComponent() {
          return <div>Content</div>;
        }
      `,
      options: [
        {
          exclude: ['Provider']
        }
      ],
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function RegularComponent() {
          return <div data-testid="RegularComponent">Content</div>;
        }
      `
    },
    // Exclude HTML tags but custom components still need testid
    {
      code: `
        function Component() {
          return <CustomDiv>Content</CustomDiv>;
        }
      `,
      options: [
        {
          exclude: ['div']
        }
      ],
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function Component() {
          return <CustomDiv data-testid="Component">Content</CustomDiv>;
        }
      `
    },
    {
      code: `
        function Component() {
          return <MySpan>Content</MySpan>;
        }
      `,
      options: [
        {
          exclude: ['span']
        }
      ],
      errors: [
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function Component() {
          return <MySpan data-testid="Component">Content</MySpan>;
        }
      `
    },
    // Fragment children are not root elements, so they don't need testid
    // This test case is removed because Fragment children are not considered root elements
    // Complex nested structure
    {
      code: `
        function App() {
          return (
            <div>
              <Header />
              <Main>
                <Sidebar />
                <Content />
              </Main>
            </div>
          );
        }
        function Header() {
          return <header>Header</header>;
        }
        function Main({ children }: { children: React.ReactNode }) {
          return <main>{children}</main>;
        }
        function Sidebar() {
          return <aside>Sidebar</aside>;
        }
        function Content() {
          return <section>Content</section>;
        }
      `,
      errors: [
        {
          messageId: 'missingTestId'
        },
        {
          messageId: 'missingTestId'
        },
        {
          messageId: 'missingTestId'
        },
        {
          messageId: 'missingTestId'
        },
        {
          messageId: 'missingTestId'
        }
      ],
      output: `
        function App() {
          return (
            <div data-testid="App">
              <Header />
              <Main>
                <Sidebar />
                <Content />
              </Main>
            </div>
          );
        }
        function Header() {
          return <header data-testid="Header">Header</header>;
        }
        function Main({ children }: { children: React.ReactNode }) {
          return <main data-testid="Main">{children}</main>;
        }
        function Sidebar() {
          return <aside data-testid="Sidebar">Sidebar</aside>;
        }
        function Content() {
          return <section data-testid="Content">Content</section>;
        }
      `
    }
  ]
});
