import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import firebase from '../../config/firebaseService';
import { logout } from '../../store/actions/firebaseAuth';
import { getAuthenticationStatus } from '../../config/authService';

type HeaderProps = {
  currentUser: any;
  logout: any;
  history: any;
}

type HeaderState = {
  name: string;
  users: any[];
  focused: boolean;
  searchOpen: boolean;
}

class Header extends Component<HeaderProps, HeaderState> {
  refUsers: any;

  state: HeaderState = {
    name: '',
    users: [],
    focused: false,
    searchOpen: false,
  }

  handleLogout = (event: any) => {
    event.preventDefault();
    this.refUsers = null;
    this.props.logout();
    window.location.href = '/'
    console.log('Logged out');
  }

  componentDidMount = () => {
    this.refUsers = firebase
      .firestore()
      .collection('users')
  }

  componentWillUnmount = () => {
    this.refUsers = null;
  }

  searchUser = (event: any) => {
    this.setState({
      name: event.target.value,
    });
  
    this.refUsers.onSnapshot((querySnapshot: any) => {
      this.setState({ users: [] })
      querySnapshot.forEach((user: any) => {
        if(user.data().firstName.toLocaleLowerCase().includes(this.state.name.toLocaleLowerCase())) {
          this.setState((prevState: HeaderState) => {
            return ({
              users: [...prevState.users, user.data()],
            });
          });
        }
      })
    })
  }

  handleSubmit = (event: any) => {
    event.preventDefault();
    this.props.history.push(`/users/${this.state.users[0].documentId}`)
    this.setState({ 
      focused: false,
      name: '',
      searchOpen: !this.state.searchOpen
     });
  }

  onFocus = () => {
    this.setState({ focused: true });
  }

  onBlur = () => {
    // TO THINK OF ANOTHER WAY
    setTimeout(() => {
      this.setState({ 
        name: '',
        focused: false
       });
    }, 300);
  }

  openSearch = () => {
    this.setState({ searchOpen: !this.state.searchOpen });
  }

  renderContent = () => {
    if (!getAuthenticationStatus()) {
      return (
        <React.Fragment>
          <Link to="/posts"><li><span className="explore-icon"></span></li></Link>
          <Link to="/signup"><li><span className="sign-up-icon"></span></li></Link>
          <Link to="/signin"><li><span className="sign-in-icon"></span></li></Link>
        </React.Fragment>
      );
    }
    const showHideClassName = this.state.searchOpen ? 'search open' : 'search';
    return (
      <React.Fragment>
        <form className="search-container" onSubmit={this.handleSubmit}>
          <div className={showHideClassName}>
            <input 
              type="search"
              onChange={this.searchUser}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              value={this.state.name}
              className="search-box"
            />
            <span onClick={this.openSearch} className="search-button">
              <span className="search-icon"></span>
            </span>
          </div>
          {this.state.users.length > 0 && this.state.focused && (
            <ul className="search-results-list">
              {this.state.users.map((username: any, index: any) => {
                return (
                  <li>
                    <Link
                      to={`/users/${username.documentId}`} 
                      key={index}
                    >
                      <img className="search-avatar" src={username.profilePhotoUrl} alt='avatar' />
                      <span>{ `${username.firstName} ${username.lastName}` }</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </form>
        <li><Link to="/"><span className="home-icon"></span></Link></li>
        <li><Link to="/posts"><span className="explore-icon"></span></Link></li>
        <li><Link to="/posts/create"><span className="create-post-icon"></span></Link></li>
        <li>
          <Link to={(this.props.currentUser && `/users/${this.props.currentUser.documentId}`) || '/home'}>
            <span className="profile-icon"></span>
          </Link>
        </li>
        <li>
          <Link to="/" onClick={this.handleLogout}>
            <span className="sign-out-icon"></span>
          </Link>
        </li>
      </React.Fragment>
    )
  }
  
  render = () => {
    return (
      <header className="header-container">
        <div className="logo-container">
          <Link to="/"><span className="logo-icon"></span></Link>
        </div>
        <nav>
          <ul className="header-nav-container">
            { this.renderContent() }
          </ul>
        </nav>
      </header>
    );
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser };
}

export default withRouter(connect(mapStateToProps, { logout })(Header));