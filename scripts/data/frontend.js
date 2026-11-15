// Frontend questions: 28 total
// react (12), redux (8), nextjs (8)
module.exports = function(addQ) {
  // --- REACT (12) ---
  addQ({
    id: "react-01",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Component lifecycle and rendering",
    subtopic: "Virtual DOM & Reconciliation (Fiber)",
    question_title: "How does the Virtual DOM and React Fiber Reconciliation algorithm work?",
    question_prompt: "Explain how React computes UI updates using the Virtual DOM. What is React Fiber, how does it enable incremental rendering / interruptible work, and what are the diffing heuristics?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Virtual DOM: Lightweight in-memory JavaScript representation of the actual DOM tree.",
      "React Fiber: Complete rewrite of React's reconciliation engine that splits work into incremental units (fiber nodes) linked as a singly-linked list (child, sibling, return).",
      "Interruptible work: Fiber allows pausing, aborting, or prioritizing work (e.g. user input prioritized over background data rendering).",
      "Two phases: Render phase (asynchronous, creates workInProgress tree, can be interrupted) and Commit phase (synchronous, applies mutations to the real DOM).",
      "Diffing heuristics (O(n) complexity): Two elements of different types produce different trees; keys uniquely identify elements across renders."
    ],
    sample_answer: "React's Virtual DOM represents the UI in memory. The Fiber reconciliation engine breaks rendering into small work units modeled as a linked list of Fiber nodes. Unlike the old recursive stack reconciler, Fiber's Render Phase is interruptible, allowing React to yield to user inputs before resuming background rendering. Once the workInProgress tree is complete, the Commit Phase runs synchronously to apply DOM mutations in one efficient batch.",
    follow_up_questions: [
      "Why must the Commit Phase in React Fiber be synchronous?",
      "Why is using array index as a key problematic during list reordering?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "react-02",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Hooks: useState, useEffect, useMemo and useCallback",
    subtopic: "useMemo vs useCallback",
    question_title: "When should you use useMemo versus useCallback, and what are the overhead costs?",
    question_prompt: "Compare useMemo and useCallback. When is memoization actually necessary versus premature optimization? What are the memory and comparison costs of dependency arrays?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "useMemo caches the result of an expensive calculation (useMemo(() => compute(a, b), [a, b])).",
      "useCallback caches a function definition reference between renders (useCallback(() => doSomething(a), [a])).",
      "When to use useCallback: When passing callback functions to child components wrapped in React.memo to prevent unnecessary child re-renders, or when the callback is in another hook's dependency array.",
      "Overhead: Every useMemo/useCallback consumes memory for storing closure references and adds CPU overhead on every render to shallow-compare dependency arrays.",
      "Rule: Do not memoize cheap computations (simple array filters with 10 elements); use memoization only for verified performance bottlenecks."
    ],
    sample_answer: "useMemo caches a computed return value, while useCallback caches a function instance reference. Use useCallback when passing functions to children memoized with React.memo to maintain referential equality across renders, or when a function is used in a useEffect dependency list. However, memoization introduces memory and comparison overhead; avoid wrapping every trivial inline handler with useCallback unless profiling proves it prevents costly re-renders.",
    follow_up_questions: [
      "How does React.memo determine whether a component should re-render?",
      "Why does an empty dependency array [] cause stale closure bugs inside useCallback?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "react-03",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Hooks: useState, useEffect, useMemo and useCallback",
    subtopic: "useEffect Lifecycle & Cleanup Functions",
    question_title: "How does useEffect handle dependencies and cleanup functions?",
    question_prompt: "Explain how useEffect mimics componentDidMount, componentDidUpdate, and componentWillUnmount. Why is the cleanup function critical for event listeners, timers, and aborting fetch requests?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Execution timing: useEffect runs asynchronously AFTER the browser paints, avoiding blocking DOM layout.",
      "Dependencies: No array = runs after every render; [] = runs once on mount; [dep1, dep2] = runs when dependencies change (Object.is comparison).",
      "Cleanup function: Returned function runs before re-running the effect on dependency change AND when component unmounts.",
      "Crucial cleanups: clearInterval/clearTimeout, window.removeEventListener, cancelling WebSocket/SSE connections, and AbortController.abort() for in-flight fetch requests.",
      "React 18 Strict Mode mounts, unmounts, and re-mounts components in development to expose missing cleanups."
    ],
    sample_answer: "useEffect synchronizes components with external systems. It runs after render. If dependencies change, React first runs the cleanup function from the previous render, then executes the new effect; on unmount, cleanup runs one last time. Cleanup functions are vital to prevent memory leaks by clearing intervals, removing global event listeners, and aborting pending HTTP requests using AbortController. React 18 Strict Mode mounts and unmounts components twice in dev to catch un-cleaned side effects.",
    follow_up_questions: [
      "What is the difference between useEffect and useLayoutEffect?",
      "Why should you not mutate state directly inside useEffect without a dependency guard?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "react-04",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Components, props and state",
    subtopic: "State Batching in React 18",
    question_title: "How does Automatic Batching work in React 18?",
    question_prompt: "Explain how React batches multiple state updates to prevent redundant re-renders. How did React 18 expand batching to promises, setTimeout, and native event handlers, and how can you opt out with flushSync?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Batching: React groups multiple state updates into a single re-render to maximize performance.",
      "Pre-React 18: Only batched state updates inside React synthetic event handlers (onClick, onChange). Updates inside setTimeout, Promise.then, or fetch triggered separate re-renders.",
      "React 18 Automatic Batching: Batches ALL state updates everywhere automatically (promises, setTimeout, native event listeners, async callbacks).",
      "flushSync: Escape hatch (ReactDOM.flushSync(() => { setCount(c => c + 1) })) that forces React to synchronously re-render immediately (useful for reading DOM layout immediately after an update)."
    ],
    sample_answer: "Automatic batching groups multiple setState calls into a single re-render. Before React 18, batching only occurred inside React event handlers; state changes inside async promises or timeouts triggered separate re-renders for each setter. React 18 batches all state updates across promises, timers, and native events automatically. If you must read updated DOM measurements immediately, ReactDOM.flushSync() provides an escape hatch to force an immediate synchronous render.",
    follow_up_questions: [
      "Why does reading state immediately after calling setState(newValue) still return the old value?",
      "When should functional state updates (setCount(prev => prev + 1)) be used?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "react-05",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Context and state sharing",
    subtopic: "Context API & Re-rendering Pitfalls",
    question_title: "How does React Context work, and how do you prevent unnecessary consumer re-renders?",
    question_prompt: "Explain createContext, Provider, and useContext. Why does any update to context value cause ALL consumers to re-render, and how do you optimize context using state splitting and memoization?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Context provides a way to pass data through the component tree without prop drilling.",
      "Re-render issue: Whenever the 'value' prop passed to Context.Provider changes referentially, EVERY component calling useContext(MyContext) re-renders, bypassing React.memo.",
      "Mitigation 1: Split contexts — separate frequently changing data from rarely changing data (e.g. UserStateContext vs UserDispatchContext).",
      "Mitigation 2: Memoize the provider value object with useMemo(() => ({ state, dispatch }), [state]).",
      "Mitigation 3: Component composition (lifting children out of provider to avoid re-rendering children)."
    ],
    sample_answer: "React Context shares data across the component tree without prop drilling. However, whenever the Provider value changes, all components consuming that context re-render, even if they only read an unaffected property. To optimize, split contexts into separate providers for state and dispatch (so consumers only needing dispatch never re-render when state changes), and always wrap provider value objects in useMemo.",
    follow_up_questions: [
      "When should you use Redux Toolkit or Zustand instead of React Context?",
      "What happens if a component calls useContext for a context without an ancestor Provider?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "react-06",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Error boundaries and component design",
    subtopic: "Error Boundaries in React",
    question_title: "How do Error Boundaries work in React, and what errors can they NOT catch?",
    question_prompt: "Explain how Error Boundaries catch rendering errors using getDerivedStateFromError and componentDidCatch. What 4 types of errors are NOT caught by Error Boundaries?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Error Boundary: A class component that defines static getDerivedStateFromError (updates state to render fallback UI) and componentDidCatch (logs error details to reporting service like Sentry).",
      "Catches: Errors during rendering, in lifecycle methods, and in constructors of the tree below them.",
      "4 Errors NOT caught: 1) Event handlers (must use standard try/catch inside onClick); 2) Asynchronous code (e.g. setTimeout or requestAnimationFrame); 3) Server-side rendering (SSR); 4) Errors thrown inside the Error Boundary component itself."
    ],
    sample_answer: "Error Boundaries are class components implementing getDerivedStateFromError (to display a fallback UI) and componentDidCatch (to log errors to observability tools). They catch runtime errors in child component rendering, constructors, and lifecycle methods, preventing the entire app from crashing. However, they do NOT catch errors in event handlers, async callbacks/timers, SSR, or errors thrown inside the boundary itself.",
    follow_up_questions: [
      "Why can't functional components with hooks be used as Error Boundaries yet?",
      "How does the react-error-boundary library simplify error boundary implementation with fallback components?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "react-07",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Forms and controlled inputs",
    subtopic: "Controlled vs Uncontrolled Components",
    question_title: "Compare Controlled and Uncontrolled Components in React form handling.",
    question_prompt: "Explain the difference between controlled inputs (value + onChange) and uncontrolled inputs (useRef / defaultValue). When is React Hook Form preferred for large enterprise forms?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Controlled: Form input value is driven by React component state. Every keystroke triggers state update and re-render. Best for immediate validation, dynamic disable states, and formatting.",
      "Uncontrolled: Form data is handled by the DOM itself. Values are pulled on submit using useRef() or FormData. Minimal re-renders on keystroke.",
      "React Hook Form: Employs uncontrolled inputs via refs, isolating re-renders to individual fields during validation. Vastly outperforms controlled form states on forms with dozens of fields."
    ],
    sample_answer: "Controlled components bind input values to React state via 'value' and 'onChange', giving full control over validation and formatting on every keystroke at the cost of re-rendering. Uncontrolled components let the DOM store state, accessing values via useRef on submit. Libraries like React Hook Form use uncontrolled inputs under the hood to deliver exceptional performance on complex enterprise forms by eliminating keystroke re-renders.",
    follow_up_questions: [
      "What causes the warning: 'A component is changing an uncontrolled input to be controlled'?",
      "How do you integrate Zod validation schemas with React Hook Form?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "react-08",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Hooks: useState, useEffect, useMemo and useCallback",
    subtopic: "Custom Hooks & Logic Extraction",
    question_title: "How do you design a reusable Custom Hook (e.g. useDebounce or useFetch)?",
    question_prompt: "Explain the rules of custom hooks (use prefix, calling other hooks). Walk through the implementation of a custom useDebounce<T>(value: T, delay: number): T hook.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Rules: Must start with 'use' so linter enforces Rules of Hooks; can invoke other built-in or custom hooks.",
      "useDebounce implementation: Internal state 'debouncedValue' initialized to value.",
      "useEffect with [value, delay] dependency sets a setTimeout to update debouncedValue.",
      "Cleanup function calls clearTimeout(timer) if value or delay changes before timeout expires.",
      "Returns debouncedValue."
    ],
    sample_answer: "A custom hook is a JavaScript function whose name starts with 'use' that encapsulates reusable stateful logic using built-in hooks. For example, useDebounce<T>(value: T, delay: number): T manages internal state initialized to value. A useEffect with dependencies [value, delay] sets a setTimeout to update the debounced state, returning a cleanup function that cancels the timer via clearTimeout if the input value changes before the delay elapses.",
    follow_up_questions: [
      "Do two components using the same custom hook share state?",
      "Why can't hooks be called conditionally inside if-statements?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "react-09",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Performance and reconciliation",
    subtopic: "React 18 Concurrent Features: useTransition & useDeferredValue",
    question_title: "Explain React 18 Concurrent Features: useTransition and useDeferredValue.",
    question_prompt: "How do useTransition and useDeferredValue improve UI responsiveness during heavy rendering? How does React differentiate urgent updates from non-urgent transitions?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Urgent updates: Direct user interactions (typing in input, clicking tabs) must update immediately to avoid UI lag.",
      "Non-urgent (transition) updates: Filtering a 5,000-row list or switching charts based on input.",
      "startTransition: Wraps state updates to mark them as non-urgent, allowing React to interrupt their rendering if user types another character.",
      "useTransition: Returns [isPending, startTransition], providing a loading indicator while the transition renders in background.",
      "useDeferredValue: Defers updating a value until urgent updates finish, functioning similarly to debounce without arbitrary millisecond delays."
    ],
    sample_answer: "React 18 Concurrent Mode distinguishes between urgent updates (like typing in a text field) and non-urgent transitions (like filtering a heavy list). Wrapping a state update in startTransition allows React to interrupt the list re-render if the user types a new key, keeping the input responsive. useDeferredValue takes a value and defers its update until high-priority work completes, rendering stale content with a pending indicator until ready.",
    follow_up_questions: [
      "What is the difference between useDeferredValue and debouncing with setTimeout?",
      "How does Suspense work with useTransition during navigation?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "react-10",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Performance and reconciliation",
    subtopic: "Code Splitting with React.lazy and Suspense",
    question_title: "How do you implement Code Splitting using React.lazy and Suspense?",
    question_prompt: "Explain how React.lazy and dynamic import() break monolithic JavaScript bundles into smaller chunks. How does Suspense provide fallback loading UI while chunks load over the network?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Problem: Monolithic bundle requires the client to download the entire application before rendering the initial page, causing poor LCP and TTI.",
      "dynamic import(): const AdminDashboard = React.lazy(() => import('./AdminDashboard')).",
      "Webpack/Vite splits AdminDashboard into a separate chunk loaded on demand.",
      "Suspense boundary: <Suspense fallback={<LoadingSpinner />}><AdminDashboard /></Suspense> displays fallback spinner while the chunk transfers.",
      "Route-based splitting: Splitting at route boundaries is the most effective code-splitting pattern in SPAs."
    ],
    sample_answer: "Code splitting breaks large JavaScript bundles into smaller on-demand chunks. React.lazy takes a dynamic import() function to lazily load a component only when it is rendered. Wrapping lazy components in a <Suspense fallback={<Spinner />}> boundary ensures a loading state is rendered while the network transfers the chunk. This dramatically reduces initial bundle size and First Contentful Paint times.",
    follow_up_questions: [
      "What happens if network failure prevents a React.lazy chunk from downloading?",
      "How does Next.js handle code splitting automatically without explicit React.lazy calls?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "react-11",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Hooks: useState, useEffect, useMemo and useCallback",
    subtopic: "useRef & DOM Manipulation",
    question_title: "When should you use useRef in React, and how does forwardRef work?",
    question_prompt: "Explain the two primary use cases of useRef: persisting mutable values across renders without triggering re-render, and accessing underlying DOM elements. How does React.forwardRef pass refs to child components?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "useRef returns a mutable object { current: initialValue } whose reference remains stable across the entire component lifecycle.",
      "Difference from state: Modifying ref.current does NOT trigger a re-render. Ideal for storing timer IDs, previous prop values, or scroll positions.",
      "DOM access: Passing ref to <input ref={inputRef} /> attaches the raw HTMLInputElement to ref.current for focus management or measurements.",
      "forwardRef: By default, ref props cannot be passed to functional components. React.forwardRef((props, ref) => ...) allows a parent to pass a ref down to a child's internal DOM node."
    ],
    sample_answer: "useRef provides a persistent container whose .current property can hold any mutable value without triggering a re-render when changed. It is used to store mutable variables across renders (like interval IDs) and to hold direct DOM element references (e.g. inputRef.current.focus()). Because standard React components do not accept ref as a prop, forwardRef is used to pass parent refs down to child DOM elements.",
    follow_up_questions: [
      "What is useImperativeHandle and how does it restrict what a parent can access via a child's ref?",
      "Why shouldn't you read or write ref.current during the render phase?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "react-12",
    skill_slug: "react",
    skill_name: "React",
    skill_category: "frontend",
    topic: "Components, props and state",
    subtopic: "Prop Drilling & Component Composition",
    question_title: "How does Component Composition solve Prop Drilling without Context?",
    question_prompt: "Explain Prop Drilling. How can passing components as children or explicit props (e.g. left={<Nav />} right={<Profile />}) eliminate prop drilling while keeping components decoupled?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Prop Drilling: Passing props down through multiple layers of intermediate components that do not need the data themselves, merely to deliver it to a deeply nested child.",
      "Component Composition solution: Instead of passing data down, lift the child component creation up to the parent where the data already lives.",
      "Using 'children': <Page><Feed user={user} /></Page> where Page simply renders {children} without knowing about 'user'.",
      "Slot pattern: Passing JSX elements as named props (<Layout header={<Header user={user} />} sidebar={<Sidebar />} />).",
      "Benefits: Avoids unnecessary context providers, keeps intermediate components pure, and simplifies unit tests."
    ],
    sample_answer: "Prop drilling is passing props through intermediary components that don't need them. Component composition solves this without Context by lifting child creation to the parent that owns the data and passing the constructed components down via 'children' or named slot props (e.g. header={<UserNav user={user} />} sidebar={<Menu />}). Intermediary layout components simply render the slots, completely eliminating intermediate prop passing.",
    follow_up_questions: [
      "What are Higher-Order Components (HOC) and how do they compare with render props and hooks?",
      "When does Context become cleaner than extreme component composition?"
    ],
    estimated_minutes: 10
  });

  // --- REDUX / REDUX TOOLKIT (8) ---
  addQ({
    id: "redux-01",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "Store, actions and reducers",
    subtopic: "Redux Architecture & Three Principles",
    question_title: "Explain the Three Core Principles of Redux and its unidirectional data flow.",
    question_prompt: "What are the three fundamental principles of Redux (Single source of truth, State is read-only, Changes made with pure functions)? Trace how an action dispatches to a reducer to update the store and notify subscribers.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "1. Single source of truth: The global state of the application is stored in an object tree within a single Redux store.",
      "2. State is read-only: The only way to change state is to dispatch an action (an object with a type and payload).",
      "3. Changes made with pure functions: Reducers are pure functions (previousState, action) => newState that return a new state object without mutating previous state.",
      "Unidirectional flow: UI triggers event -> dispatch(action) -> middleware -> reducer computes new state -> store updates -> useSelector hooks notify React components to re-render."
    ],
    sample_answer: "Redux enforces unidirectional data flow based on three principles: single source of truth (one central store), read-only state (mutations are requested via dispatched action objects), and pure reducer functions that return a new immutable state without side effects. When a user interacts with the UI, an action is dispatched to the store, processed by middleware and reducers to compute the new state, and components subscribed via useSelector re-render.",
    follow_up_questions: [
      "Why must Redux reducers be pure functions with zero side effects?",
      "What is Redux DevTools and how does time-travel debugging work?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "redux-02",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "Redux Toolkit slices",
    subtopic: "createSlice & Immer Integration",
    question_title: "How does createSlice in Redux Toolkit simplify state management and leverage Immer?",
    question_prompt: "Explain how createSlice eliminates Redux boilerplate (action types, action creators, switch-case reducers). How does Immer allow writing 'mutating' code (state.count++) while preserving immutability?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Boilerplate elimination: createSlice automatically generates action types and action creator functions from reducer method names.",
      "Immer integration: Inside createSlice reducers, Redux Toolkit wraps state in an Immer Draft proxy.",
      "Direct mutation syntax: You can write 'state.users.push(user)' or 'state.user.name = \"Alice\"'.",
      "How Immer works: The Proxy records all mutations and automatically generates a brand-new immutable copy on function completion.",
      "Rule: Inside an Immer reducer, you must either mutate the draft OR return a new value, but never both."
    ],
    sample_answer: "Redux Toolkit's createSlice bundles action creators, action types, and reducers into one definition. It integrates Immer, which proxies the state object: developers write intuitive 'mutating' logic like state.items.push(item) or delete state[id], and Immer tracks modifications to produce a safe, immutable new state tree automatically. This eliminates verbose spread operators ({ ...state, nested: { ...state.nested } }).",
    follow_up_questions: [
      "What error occurs if you both mutate draft state AND return a new object inside an RTK reducer?",
      "How do extraReducers in createSlice handle actions generated by other slices or async thunks?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "redux-03",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "Async thunks and API state",
    subtopic: "createAsyncThunk & Lifecycle Actions",
    question_title: "How does createAsyncThunk handle asynchronous operations in Redux Toolkit?",
    question_prompt: "Walk through createAsyncThunk: defining the payload creator, handling the three dispatched lifecycle actions (pending, fulfilled, rejected), and updating state in extraReducers with builder.addCase.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "createAsyncThunk accepts an action type prefix ('users/fetch') and an async payload creator function.",
      "Automatically dispatches 3 actions: pending (request starts), fulfilled (promise resolves with payload), and rejected (promise errors or rejectWithValue called).",
      "extraReducers handles these actions using the type-safe builder callback: builder.addCase(fetchUsers.pending, ...).",
      "rejectWithValue: Allows passing custom error payloads (e.g. backend validation message DTO) into the rejected action.",
      "Stores standard loading flags: state.status = 'loading' | 'succeeded' | 'failed' and state.error."
    ],
    sample_answer: "createAsyncThunk takes an action prefix and an async function returning a promise. It automatically generates and dispatches pending, fulfilled, and rejected action types. In the slice's extraReducers builder callback, addCase handles each lifecycle phase to update loading flags, store fetched data, or record errors. For custom backend error payloads, rejectWithValue extracts specific API error messages into the rejected action.",
    follow_up_questions: [
      "What is the difference between createAsyncThunk and RTK Query?",
      "How can you cancel an in-flight createAsyncThunk promise using AbortController?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "redux-04",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "Selectors and derived state",
    subtopic: "createSelector & Memoized Selectors",
    question_title: "How does createSelector (Reselect) optimize React component performance?",
    question_prompt: "Explain how createSelector creates memoized selectors. Why does computing derived state directly inside useSelector cause unnecessary re-renders, and how does memoization prevent it?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "useSelector comparison: Uses strict reference equality (===) by default. If a selector returns a new array reference (e.g. state.todos.filter(...)), the component re-renders on EVERY dispatch even if items didn't change.",
      "createSelector: Accepts input selectors and a transform function.",
      "Memoization: Caches input parameters. If inputs reference-equal previous inputs, it returns the cached result without running the transform function, preserving referential equality.",
      "Component only re-renders when the derived result actually changes."
    ],
    sample_answer: "useSelector compares results using reference equality (===). If you return a new array from .filter() or .map() inside useSelector, it produces a new memory reference on every action, triggering re-renders. createSelector (from Reselect) memoizes the computation: it runs the transformation only when input selector values change. If the underlying data is unchanged, it returns the exact same cached reference, preventing wasted component renders.",
    follow_up_questions: [
      "What is shallowEqual and how can it be passed to useSelector as an equality function?",
      "How do you create parameterized selectors that accept component props using createSelector?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "redux-05",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "Async thunks and API state",
    subtopic: "RTK Query (RTKQ) vs Plain Redux",
    question_title: "What is RTK Query, and how does it automate server caching and data fetching?",
    question_prompt: "Compare traditional Redux data fetching with RTK Query (createApi). Explain automated caching, request deduplication, cache tags (providesTags / invalidatesTags), and auto-generated React hooks.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Problem with plain Redux: Writing boilerplate thunks, loading flags, error handling, and manual cache invalidation for every API endpoint.",
      "RTK Query: Declarative data fetching and caching layer built on Redux Toolkit.",
      "Auto-generated hooks: createApi automatically generates useGetPostsQuery, useAddPostMutation.",
      "Cache tags: Endpoints declare providesTags: ['Post']; mutations declare invalidatesTags: ['Post']. When a mutation succeeds, RTK Query automatically refetches all active queries providing that tag.",
      "Deduplication & Polling: Deduplicates concurrent requests for the same endpoint and supports polling and optimistic updates out of the box."
    ],
    sample_answer: "RTK Query eliminates manual API state management in Redux. You define endpoints in createApi, and RTK Query generates custom React hooks (useGetTodosQuery, useAddTodoMutation). It automatically handles caching, loading states, and request deduplication. Using cache tags (providesTags / invalidatesTags), a successful mutation automatically triggers background re-fetching of all queries subscribed to invalidated tags, keeping the UI in sync without manual dispatching.",
    follow_up_questions: [
      "How do optimistic updates work in RTK Query using onQueryStarted?",
      "How does RTK Query manage cache cleanup when components unmount (keepUnusedDataFor)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "redux-06",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "Store, actions and reducers",
    subtopic: "Redux Middleware Architecture",
    question_title: "How does Redux Middleware work, and how is the pipeline constructed?",
    question_prompt: "Explain the curried middleware signature: ({ dispatch, getState }) => next => action => { ... }. How do middlewares intercept actions, perform logging/analytics, and pass actions down the chain?",
    question_type: "coding",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Middleware sits between dispatching an action and the moment it reaches the reducer.",
      "Curried signature: store => next => action.",
      "store provides getState() and dispatch(); next(action) forwards the action to the next middleware in the pipeline (or reducer if at the end).",
      "Intercepting: Middleware can inspect actions, modify payloads, swallow actions (not calling next), or dispatch secondary actions.",
      "Examples: Redux Thunk (inspects if action is a function instead of plain object, invoking it with dispatch and getState), Redux Logger."
    ],
    sample_answer: "Redux middleware provides a third-party extension point between dispatching an action and running reducers. Written as a curried function (store => next => action), it receives the action, can inspect state via getState(), perform side effects (logging, analytics, token injection), and either call next(action) to pass it down the pipeline or suppress it. Redux Thunk works by checking if action is a function: if so, it executes the function passing dispatch and getState instead of calling next().",
    follow_up_questions: [
      "What happens if a middleware calls store.dispatch(action) instead of next(action)?",
      "How do you add custom middleware to configureStore in Redux Toolkit?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "redux-07",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "When to use local state versus global state",
    subtopic: "Global vs Server vs Component State",
    question_title: "How do you decide between Component Local State, Global Client State, and Server State?",
    question_prompt: "Explain rules for state location: When to use useState/useReducer vs Redux Toolkit vs React Query/RTK Query vs URL search params. Why is storing everything in Redux an anti-pattern?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Component Local State (useState/useReducer): Ephemeral UI state used in 1 component (modal open, dropdown toggle, form input value).",
      "URL State (?tab=orders&page=2): Shareable state that needs to survive page refreshes and be bookmarkable (search queries, filters, active pagination).",
      "Server State (TanStack Query / RTK Query): Remote data cached locally (users, products). Managed by dedicated query caches with background refetching and invalidation.",
      "Global Client State (Redux / Zustand): Client-only state shared across multiple disparate features (shopping cart, audio player state, user preferences, theme).",
      "Storing everything in Redux creates bloat, unnecessary re-renders, and defeats browser caching."
    ],
    sample_answer: "Modern React categorizes state into four buckets: Local State (useState for component-isolated toggles/inputs), URL State (search params for bookmarkable filters and pagination), Server Cache (RTK Query / TanStack Query for remote database data with caching/revalidation), and Global Client State (Redux/Zustand for cross-cutting client data like shopping carts or active audio players). Storing ephemeral form inputs or raw API results in manual Redux reducers is an obsolete anti-pattern.",
    follow_up_questions: [
      "Why is URL state preferred over Redux state for filter and pagination controls?",
      "How does Zustand compare to Redux Toolkit for lightweight global state?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "redux-08",
    skill_slug: "redux",
    skill_name: "Redux / Redux Toolkit",
    skill_category: "frontend",
    topic: "Store, actions and reducers",
    subtopic: "Normalizing State Shape with createEntityAdapter",
    question_title: "How does createEntityAdapter normalize relational state in Redux Toolkit?",
    question_prompt: "Why should nested arrays of objects be normalized into { ids: [], entities: {} } in Redux? How does createEntityAdapter provide pre-built CRUD reducers (addOne, upsertMany, removeOne) and selectors?",
    question_type: "coding",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Problem with arrays: Updating an item in an array requires iterating/mapping O(n); duplicate items across lists get out of sync.",
      "Normalized shape: Emulates a database table with an array of sorted IDs ({ ids: [1, 2], entities: { 1: {...}, 2: {...} } }).",
      "Lookup is O(1): state.entities[id].",
      "createEntityAdapter: Generates initial state, pre-built CRUD reducer functions (setAll, addOne, upsertMany, removeOne), and memoized selectors (selectAll, selectById).",
      "Supports custom selectId and sortComparer functions."
    ],
    sample_answer: "Storing relational data as nested arrays causes O(n) lookups and synchronization bugs. Normalizing data into { ids: [1, 2], entities: { 1: obj1, 2: obj2 } } provides O(1) lookups and updates. Redux Toolkit's createEntityAdapter automates this pattern, generating standardized state structures, CRUD operations (addOne, upsertMany, removeOne), and optimized memoized selectors (selectAll, selectById) out of the box.",
    follow_up_questions: [
      "How does createEntityAdapter handle sorting when items are updated?",
      "How do you select an entity by ID directly inside a component using adapter selectors?"
    ],
    estimated_minutes: 12
  });

  // --- NEXT.JS (8) ---
  addQ({
    id: "next-01",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "Server and Client Components",
    subtopic: "React Server Components (RSC) vs Client Components",
    question_title: "Explain the architecture of React Server Components (RSC) vs Client Components in Next.js App Router.",
    question_prompt: "What are the core differences between Server Components and Client Components ('use client')? Discuss bundle size impact, direct database access, serialization boundaries, and where hydration occurs.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Server Components (default in App Router): Render purely on the server. Zero JavaScript shipped to the client browser (smaller bundle). Can query database/files directly and keep secrets server-side.",
      "Client Components ('use client' directive at file top): Pre-rendered on server into HTML and hydrated on the client. Required for browser interactivity: event listeners (onClick), state (useState), lifecycle hooks (useEffect), and browser APIs (localStorage).",
      "Serialization boundary: Props passed from Server Components to Client Components must be serializable across the network (no functions or class instances).",
      "Composition: Server Components can import Client Components; Client Components cannot directly import Server Components, but can receive them as {children} slots."
    ],
    sample_answer: "In Next.js App Router, components are Server Components by default. They execute exclusively on the server, shipping zero JavaScript to the browser and allowing direct database queries with secure credentials. Adding 'use client' marks the file as a Client Component, which is pre-rendered to HTML on the server and hydrated in the browser to enable interactivity (useState, useEffect, onClick). Props crossing the server-to-client boundary must be JSON-serializable.",
    follow_up_questions: [
      "Can a Client Component pass a Server Component as a child prop?",
      "Why does 'use client' not mean the component runs only in the browser?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "next-02",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "App Router and layouts",
    subtopic: "App Router Layouts & Routing Hierarchy",
    question_title: "How do Layouts, Templates, and Route Groups work in Next.js App Router?",
    question_prompt: "Explain the routing file conventions: layout.tsx, page.tsx, template.tsx, loading.tsx, error.tsx, and not-found.tsx. How do nested layouts preserve state across route transitions, and what are Route Groups (folder)?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "layout.tsx: Wraps child pages and nested layouts. Preserves state and does NOT re-render on navigation across sibling routes.",
      "template.tsx: Similar to layout, but creates a brand new instance on each navigation (resets state and triggers effects, useful for page entrance animations).",
      "loading.tsx: Automatically wraps the sibling page in a React Suspense boundary with instant loading UI.",
      "error.tsx: Client component ('use client') acting as an Error Boundary wrapping page subtree.",
      "Route Groups ((folderName)): Organizes routes logically without affecting URL pathname (e.g. (auth)/login and (app)/dashboard share different root layouts while living at /login and /dashboard)."
    ],
    sample_answer: "Next.js App Router uses file conventions within folder hierarchies. layout.tsx wraps pages and persists state across sub-route navigations without unmounting. template.tsx acts similarly but mounts a fresh instance on navigation (resetting state). loading.tsx wraps page components in Suspense for instant loading states, and error.tsx provides an Error Boundary. Route Groups ((group)) organize routes and allow multiple distinct root layouts without altering the public URL path.",
    follow_up_questions: [
      "Why must error.tsx always be a Client Component ('use client')?",
      "How do Parallel Routes (@slot) and Intercepting Routes ((.)) work in App Router?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "next-03",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "Route handlers and server actions",
    subtopic: "Server Actions & Mutations",
    question_title: "How do Server Actions work in Next.js, and how are they secured?",
    question_prompt: "Explain Server Actions ('use server'): executing server code directly from form submissions or event handlers. How do you handle Zod input validation, error return states, optimistic updates with useOptimistic, and revalidatePath?",
    question_type: "coding",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Server Actions are async functions declared with 'use server' that compile into internal POST endpoints managed by Next.js.",
      "Invoked via HTML <form action={myAction}> (works with progressive enhancement before JS loads) or imperatively from client event handlers.",
      "Security: Server Actions are publicly reachable POST endpoints; they MUST authenticate the session and validate all input arguments using Zod at the boundary.",
      "revalidatePath('/dashboard') / revalidateTag('todos'): Clears Next.js Data Cache and triggers on-demand re-rendering of affected server components.",
      "useActionState (React 19) / useFormState: Manages return values, form status, and server validation error messages.",
      "useOptimistic: Instantly renders optimistic UI updates while the server action finishes in the background."
    ],
    sample_answer: "Server Actions ('use server') are server-side functions that can be called directly from forms or client handlers. Next.js creates an internal POST RPC endpoint. Because they are open HTTP endpoints, every Server Action must verify the user's session and validate parameters with Zod. After mutating database records, calling revalidatePath() or revalidateTag() purges the server cache to refresh Server Components. Pairing with useOptimistic provides instant UI feedback while awaiting the server response.",
    follow_up_questions: [
      "Why must you never trust user credentials or role IDs passed as arguments to Server Actions?",
      "What is the difference between revalidatePath and router.refresh()?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "next-04",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "Caching and revalidation",
    subtopic: "Next.js 4-Level Caching Architecture",
    question_title: "Explain the four caching mechanisms in Next.js: Request Memoization, Data Cache, Full Route Cache, and Router Cache.",
    question_prompt: "Walk through the Next.js caching architecture: Request Memoization (React cache), Data Cache (fetch cache), Full Route Cache (static HTML/RSC on server), and Client-side Router Cache. How do you revalidate or opt out of caching?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "1. Request Memoization: React deduplicates identical fetch(url) calls within a single render pass. Scope: 1 server request lifecycle.",
      "2. Data Cache: Persistent server cache across requests and deployments (fetch(url, { next: { revalidate: 3600, tags: ['tag'] } })). Revalidated via revalidateTag/revalidatePath.",
      "3. Full Route Cache: Server caches static HTML and RSC payload at build/revalidation time for static routes. Opt-out via dynamic = 'force-dynamic' or using cookies()/headers().",
      "4. Router Cache: Client-side in-memory browser cache storing visited RSC payloads for fast back/forward navigation. Revalidated via router.refresh() or server actions.",
      "Opt-out strategies: export const dynamic = 'force-dynamic', fetch(url, { cache: 'no-store' }), or reading cookies() in Server Components."
    ],
    sample_answer: "Next.js has 4 caching levels: Request Memoization deduplicates identical fetch calls within a single render pass. The Data Cache persists fetch responses on the server across user requests until revalidated by time or tags (revalidateTag). The Full Route Cache caches static HTML/RSC payloads at build time for static routes. The Router Cache stores visited routes in browser memory for instant back/forward navigation. Using cookies(), headers(), or dynamic='force-dynamic' bypasses route caching.",
    follow_up_questions: [
      "What causes a page to be classified as Dynamic rather than Static at build time?",
      "How does Next.js 15 change default caching behavior for fetch requests?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "next-05",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "SSR, SSG and ISR concepts",
    subtopic: "Static vs Dynamic Rendering & ISR",
    question_title: "Compare Static Site Generation (SSG), Server-Side Rendering (SSR), and Incremental Static Regeneration (ISR).",
    question_prompt: "Explain how Next.js unifies SSG, SSR, and ISR in the App Router. What is generateStaticParams, how does revalidate work, and when does background revalidation trigger?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Static Rendering (SSG): HTML generated once at build time. Ultra-fast CDN delivery. Best for marketing pages, blogs, and public catalogs.",
      "Dynamic Rendering (SSR): HTML rendered on each request on the server. Used when data is personalized to the user (cookies, headers, search params).",
      "Incremental Static Regeneration (ISR): Serves cached static page, but allows revalidating in background after a time threshold (revalidate = 60). Stale-While-Revalidate pattern.",
      "generateStaticParams: Replaces getStaticPaths in App Router to pre-render dynamic segments (e.g. /posts/[id]) at build time."
    ],
    sample_answer: "Static rendering generates HTML at build time for CDN caching. Dynamic rendering renders on every request for user-specific data. Incremental Static Regeneration (ISR) blends both: it serves cached static HTML immediately, but if a request arrives after revalidate seconds, Next.js serves the stale page while regenerating the updated page in the background (stale-while-revalidate). generateStaticParams defines dynamic route segments to pre-build during deployment.",
    follow_up_questions: [
      "What is the difference between dynamicParams = true and dynamicParams = false?",
      "How does on-demand revalidation (revalidatePath) compare to time-based ISR?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "next-06",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "Route handlers and server actions",
    subtopic: "Route Handlers (API Routes)",
    question_title: "How do Route Handlers (route.ts) work in Next.js App Router?",
    question_prompt: "Explain route.ts handlers for GET, POST, PUT, DELETE. How do they handle Request and NextResponse, query parameters, dynamic segments, and CORS?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Replaces pages/api in App Router. Defined inside app/api/.../route.ts.",
      "Export named functions matching HTTP methods: export async function GET(request: Request, { params }: { params: { id: string } }).",
      "NextResponse: Helper for returning JSON (NextResponse.json(data, { status: 200 })), redirects, or setting cookies.",
      "Caching: GET handlers are cached by default unless they use the Request object, read cookies/headers, or specify export const dynamic = 'force-dynamic'.",
      "Best for webhooks, public REST APIs, or streaming responses (SSE)."
    ],
    sample_answer: "Route Handlers define backend HTTP endpoints by exporting named async functions (GET, POST, etc.) inside route.ts. They use the standard Web Request API and NextResponse.json() for responses. GET handlers are statically evaluated unless they inspect request headers, read cookies, or declare dynamic = 'force-dynamic'. Route Handlers are ideal for public API endpoints, external webhook listeners (like Stripe), and streaming endpoints.",
    follow_up_questions: [
      "When should you use Server Actions instead of Route Handlers for internal app mutations?",
      "How do you implement streaming SSE responses in a Next.js Route Handler?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "next-07",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "Navigation and metadata",
    subtopic: "Metadata API & SEO Optimization",
    question_title: "How does the Next.js Metadata API handle dynamic SEO and OpenGraph tags?",
    question_prompt: "Compare static metadata objects with generateMetadata() for dynamic pages. How does Next.js stream metadata in the <head> before page content, and how are OpenGraph images generated dynamically?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Static metadata: export const metadata: Metadata = { title: '...', description: '...' } in layout or page.",
      "Dynamic metadata: export async function generateMetadata({ params }): Promise<Metadata> fetches data and returns personalized title, description, and openGraph metadata.",
      "Deduplication: Fetch requests inside generateMetadata and the page component are automatically memoized by React cache, causing only 1 network fetch.",
      "Metadata inheritance: Deeply nested pages override or merge with parent layout metadata.",
      "Dynamic OG images: opengraph-image.tsx using ImageResponse generates dynamic social preview images at edge."
    ],
    sample_answer: "Next.js handles SEO via the Metadata API. Static pages export a metadata object, while dynamic pages export an async generateMetadata() function that fetches entity data to construct dynamic titles, descriptions, and OpenGraph tags. React automatically deduplicates fetch requests between generateMetadata and the page render. Next.js streams metadata into the HTML <head> for search crawlers, and opengraph-image.tsx dynamically generates branded social preview images.",
    follow_up_questions: [
      "What is metadataBase and why is it needed for resolving relative OpenGraph URLs?",
      "How do robots.ts and sitemap.ts work in the App Router?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "next-08",
    skill_slug: "nextjs",
    skill_name: "Next.js",
    skill_category: "frontend",
    topic: "Navigation and metadata",
    subtopic: "Middleware in Next.js",
    question_title: "How does Next.js Middleware work at the Edge?",
    question_prompt: "Explain middleware.ts: execution before routing, Edge runtime constraints, route matching (matcher config), cookie/header manipulation, and URL redirects/rewrites.",
    question_type: "coding",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Location: middleware.ts placed at project root.",
      "Runs at Edge before every matched request completes routing.",
      "Matcher config: export const config = { matcher: ['/dashboard/:path*', '/api/:path*'] } excludes static assets (_next/static, images).",
      "Capabilities: Inspect/set cookies (request.cookies / response.cookies), rewrite URLs (transparent URL masking), redirect (NextResponse.redirect), and add custom headers.",
      "Edge runtime limitations: No Node.js native APIs (fs, child_process); requires lightweight packages compatible with Edge/V8 worker runtime.",
      "Use cases: Session authentication verification, geo-routing, A/B testing, and bot protection."
    ],
    sample_answer: "Next.js middleware runs on the Edge runtime before requests complete routing. Configured with a 'matcher' regex to bypass static assets, it can inspect cookies, rewrite requests to different paths, enforce authentication by redirecting unauthenticated users to /login, and inject request headers. Because it runs in a lightweight V8 worker sandbox, it does not support native Node.js APIs like 'fs' or heavy ORMs.",
    follow_up_questions: [
      "What is the difference between a URL redirect and a URL rewrite in Next.js Middleware?",
      "How does Supabase Auth integrate with Next.js middleware to refresh access tokens?"
    ],
    estimated_minutes: 12
  });
};
