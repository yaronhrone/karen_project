import React from 'react'
import './ErrorBoundary.css'

// Catches a render-time crash anywhere below it and shows this instead of the
// blank white page the site had no protection against until now (a single
// favorited item pointing at a deleted product, or one malformed order,
// could - and did - take down the entire app, not just that section). Error
// boundaries only catch render/lifecycle errors, not ones inside event
// handlers - that's the class of bug every crash found this way turned out
// to be (a bad .map() over data with no null-guard).
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { error: null }
    }

    static getDerivedStateFromError(error) {
        return { error }
    }

    handleReload = () => {
        // Full reload, not just clearing state - the error almost certainly
        // came from data already loaded into some parent's state, and
        // re-rendering the same tree with the same state would likely just
        // crash again immediately.
        window.location.href = '/'
    }

    render() {
        if (this.state.error) {
            return (
                <div className='app-error-page'>
                    <h1>משהו השתבש</h1>
                    <p>אירעה שגיאה בטעינת העמוד. אפשר לנסות שוב - ואם זה חוזר, כדאי להעתיק את הפרטים למטה ולשלוח.</p>
                    <button className='btn btn-primary' onClick={this.handleReload}>חזרה לדף הבית</button>
                    <details className='app-error-details'>
                        <summary>פרטים טכניים</summary>
                        <pre>{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
                    </details>
                </div>
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary
