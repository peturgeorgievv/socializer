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
  showDropdownMenu: boolean;
}

class Header extends Component<HeaderProps, HeaderState> {
  refUsers: any;

  state: HeaderState = {
    name: '',
    users: [],
    focused: false,
    searchOpen: false,
    showDropdownMenu: false,
  }

  handleLogout = (event: any) => {
    event.preventDefault();
    this.refUsers = null;
    this.props.logout();
    window.location.href = '/posts'
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
        if (user.data().firstName.toLocaleLowerCase().includes(this.state.name.toLocaleLowerCase())) {
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
      searchOpen: !this.state.searchOpen,
      showDropdownMenu: !this.state.showDropdownMenu
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
    this.setState({ 
      searchOpen: !this.state.searchOpen,
    });
  }

  showAndHideDropdownMenu = (event: any) => {
    event.preventDefault();
    this.setState({ showDropdownMenu: !this.state.showDropdownMenu });
  }

  renderSearch = () => {
    const showHideClassName = this.state.searchOpen ? 'search open' : 'search';
    return (
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
                <li key={index}>
                  <Link
                    to={`/users/${username.documentId}`}
                  >
                    <img className="search-avatar" src={username.profilePhotoUrl || "https://www.esportschampionships.tv/wp-content/uploads/2019/09/341-3415688_no-avatar-png-transparent-png.jpg"} alt='avatar' />
                    <span className="user-name">{`${username.firstName} ${username.lastName}`}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </form>
    )
  }

  renderContent = () => {
    if (!getAuthenticationStatus()) {
      return (
        <React.Fragment>
          <Link to="/posts"><li className="nav-menu"><span className="explore-icon"></span></li></Link>
          <Link to="/signup"><li className="nav-menu"><span className="sign-up-icon"></span></li></Link>
          <Link to="/signin"><li className="nav-menu"><span className="sign-in-icon"></span></li></Link>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        { <span className="show-search"> { this.renderSearch() } </span> }
        <li className="nav-menu">
          <Link to="/"><span className="home-icon"></span></Link>
        </li>
        <li className="nav-menu">
          <Link to="/posts"><span className="explore-icon"></span></Link>
        </li>
        <li className="nav-menu">
          <Link to="/posts/create"><span className="create-post-icon"></span></Link>
        </li>
        <li className="nav-menu">
          <Link to={(this.props.currentUser && `/users/${this.props.currentUser.documentId}`) || '/home'}>
            <span className="profile-icon"></span>
          </Link>
        </li>
        <li className="nav-menu">
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
          { this.props.currentUser ? 
            <Link to="/"><span className="logo-icon"></span></Link>
            : <Link to="/posts"><span className="logo-icon"></span></Link>
          }
        </div>
        <nav>
          <ul className="header-nav-container">
            {this.renderContent()}
          </ul>
          <div className="dropdown">
            <span className="dropdown-icon" onClick={this.showAndHideDropdownMenu}></span>
            {
              this.state.showDropdownMenu &&
              (
                <div className="dropdown-menu">
                  <ul>
                    { this.renderSearch() }
                    <li className="" onClick={this.showAndHideDropdownMenu}>
                      <Link to="/"><span className="home-icon"></span>
                        Home
                      </Link>
                    </li>
                    <li className="" onClick={this.showAndHideDropdownMenu}>
                      <Link to="/posts"><span className="explore-icon"></span>
                        Explore
                      </Link>
                    </li>
                    <li className="" onClick={this.showAndHideDropdownMenu}>
                      <Link to="/posts/create"><span className="create-post-icon"></span>
                      Create Post
                      </Link>
                    </li>
                    <li className="" onClick={this.showAndHideDropdownMenu}>
                      <Link to={(this.props.currentUser && `/users/${this.props.currentUser.documentId}`) || '/home'}>
                        <span className="profile-icon"></span>
                        Profile
                      </Link>
                    </li>
                    <li className="" onClick={this.showAndHideDropdownMenu}>
                      <Link to="/" onClick={this.handleLogout}>
                        <span className="sign-out-icon"></span>
                        Sign Out
                      </Link>
                    </li>
                  </ul>
                </div>
              )
            }
          </div>
        </nav>
      </header>
    );
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser };
}

export default withRouter(connect(mapStateToProps, { logout })(Header));