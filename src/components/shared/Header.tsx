import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import firebase from '../../config/firebaseService';
import { logout } from '../../store/actions/firebaseAuth';
import { getAuthenticationStatus } from '../../config/authService';

class Header extends Component<any, any> {
  refUsers: any;

  state: any = {
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
          this.setState((prevState: any) => ({
            users: [...prevState.users, user.data()],
          }));
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
                  <Link
                    to={`/users/${username.documentId}`} 
                    key={index}
                  >
                      <li>
                        <img className="search-avatar" src={username.profilePhotoUrl} alt='avatar' />
                        <span>{ `${username.firstName} ${username.lastName}` }</span>
                      </li>
                  </Link>
                )
              })}
            </ul>
          )}
        </form>
        <Link to="/"><li><span className="home-icon"></span></li></Link>
        <Link to="/posts"><li><span className="explore-icon"></span></li></Link>
        <Link to="/posts/create"><li><span className="create-post-icon"></span></li></Link>
        <Link to={(this.props.currentUser && `/users/${this.props.currentUser.documentId}`) || '/home'}><li><span className="profile-icon"></span></li></Link>
        <Link to="/" onClick={this.handleLogout}><li><span className="sign-out-icon"></span></li></Link>
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