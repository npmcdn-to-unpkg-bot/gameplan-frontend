import React, { Component } from 'react';
import * as actions from '../actions/index';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';

class PostList extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentWillMount() {
    this.props.fetchPosts();

    document.title = 'GamePlan | Posts';
  }

  render() {
    if (this.props.posts.length === 0) {
      return (
        <div className="posts">
          <Link to="/posts"><h1>Posts</h1></Link>
          Loading...
        </div>
      );
    } else {
      return (
        <div className="posts">
          <div className="titlebar">
            <Link to="/posts"><h1>Posts</h1></Link>
            <div className="item">
              <Link to="/posts/new" id="plus">
                <i className="fa fa-plus" aria-hidden="true"></i>
                <p className="text">New</p>
              </Link>
            </div>
          </div>
          <ul>
            {this.props.posts.map((post) => {
              const groups = post.groups.map(group => {
                return group.name;
              }).join(', ');

              return (
                <Link to={`/posts/${post._id}`} key={post._id} className="post">
                  <li key={post._id}>
                    <div className="titlebar">
                      <div className="title">{post.title}</div>
                      <span className="groupNames">{groups}</span>
                    </div>
                    <div className="date">{moment(new Date(post.created_at)).format('MMMM Do')}</div>
                    <div className="responders">{post.author.name}</div>
                    <div className="description">{post.description}</div>
                  </li>
                </Link>
              );
            })}
          </ul>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => (
  {
    posts: state.posts.all,
  }
);

export default connect(mapStateToProps, actions)(PostList);
