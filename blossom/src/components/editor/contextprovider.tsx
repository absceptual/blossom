import { createContext } from 'react';

export const ProblemContext = createContext(undefined);

export default function ProblemContextProvider({ problemId, children }) {
    return (
        <ProblemContext.Provider value={problemId}>
            {children}
        </ProblemContext.Provider>
    );
}