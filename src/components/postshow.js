import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { browserHistory } from 'react-router';
import moment from 'moment';

class PostShow extends Component {
  constructor(props) {
    super(props);

    // init component state here
    if (this.props.post) {
      this.state = {
        isEditing: false,
        title: this.props.post.title,
        description: this.props.post.description,
        comment: '',
        alert: '',
      };
    } else {
      this.state = {
        isEditing: false,
        comment: '',
      };
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.postComment = this.postComment.bind(this);
    this.onPostDelete = this.onPostDelete.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onCommentChange = this.onCommentChange.bind(this);
  }

  componentWillMount() {
    this.props.fetchPost(this.props.params.id);
    this.props.getMe();

    clearInterval(window.chatUpdate);
    window.chatUpdate = setInterval(() => {
      this.props.fetchPost(this.props.params.id);
    }, 1000);
  }

  componentDidUpdate(prevProps) {
    if (this.props.post != null && prevProps.post != null) {
      // If new message
      if (this.props.post.chat.length > prevProps.post.chat.length && document.getElementById('chat')) {
        const chat = document.getElementById('chat');
        chat.scrollTop = chat.scrollHeight;
      }

      // If just joined
      if (this.props.post.responders.length > prevProps.post.responders.length && document.getElementById('chat')) {
        const chat = document.getElementById('chat');
        chat.scrollTop = chat.scrollHeight;
      }

      // If first time appearing
      if (prevProps.me == null && document.getElementById('chat')) {
        const chat = document.getElementById('chat');
        chat.scrollTop = chat.scrollHeight;
      }
    }

    // Check title
    if (this.props.post != null) {
      document.title = `GamePlan | ${this.props.post.title}`;
    }
  }

  onSubmit(event) {
    event.preventDefault();

    if (document.getElementsByTagName('form')[0].checkValidity()) {
      this.setState({
        isEditing: false,
        alert: '',
      });

      this.props.updatePost(
        this.props.params.id,
        {
          title: this.state.title,
          description: this.state.description,
        }
      );
    } else {
      this.setState({
        alert: 'Make sure all fields are filled out.',
      });
    }
  }

  onTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  onCommentChange(e) {
    this.setState({ comment: e.target.value });
  }

  onPostDelete() {
    this.props.deletePost(this.props.params.id);
  }

  postComment(event) {
    event.preventDefault();

    this.props.postComment(
      this.props.params.id,
      {
        text: this.state.comment,
      }
    );

    this.setState({
      comment: '',
    });
  }

  join() {
    if (this.props.me != null) {
      if (this.props.post.responders.map(responder => { return responder._id; }).indexOf(this.props.me._id) <= -1) {
        return (
          <button onClick={() => {
            const responders = this.props.post.responders.map(responder => { return responder._id; });
            responders.push(this.props.me._id);
            this.props.updatePost(
              this.props.params.id,
              {
                responders,
              }
            );
          }}>Join Post</button>
        );
      } else {
        return (
          <button onClick={() => {
            const responders = this.props.post.responders.map(responder => { return responder._id; }).filter(responder => { return (responder !== this.props.me._id); });
            this.props.updatePost(
              this.props.params.id,
              {
                responders,
              }
            );
          }}>Leave Post</button>
        );
      }
    }
  }

  edit() {
    if (this.props.post.author != null && this.props.me != null && this.props.post.author._id === this.props.me._id) {
      return (
        <button onClick={() => {
          this.setState({
            isEditing: true,
            title: this.props.post.title,
            description: this.props.post.description,
          });
        }}>Edit Post</button>
      );
    }
  }

  chat() {
    if (this.props.me != null && this.props.post.responders.map(responder => { return responder._id; }).indexOf(this.props.me._id) > -1) {
      return (
        <div className="chatwindow">
          <h2>Chat</h2>
          <div className="chat" id="chat">
            {this.props.post.chat.map(message => {
              return (
                <div className="message" key={message._id}>
                  <span className="poster">{message.poster.name}</span>
                  {message.text}
                </div>
              );
            })}
          </div>
          <form onSubmit={this.postComment}>
            <input type="text" placeholder="Type anything..." onChange={this.onCommentChange} value={this.state.comment} />
            <button type="submit">Post</button>
          </form>
        </div>
      );
    }
  }

  delete() {
    if (this.props.post.author && this.props.me && this.props.post.author._id === this.props.me._id) {
      return (
        <button type="button" className="cancel" onClick={this.onPostDelete}>Delete</button>
      );
    }
  }

  alert() {
    if (this.state.alert) {
      return (
        <div className="alert">
          {this.state.alert}
        </div>
      );
    }
  }

  render() {
    if (!this.props.authenticated) {
      browserHistory.push('/login');
    }

    if (!this.props.post) { // No set post (initially)
      return (
        <div className="viewpost">
          <div className="wrapper">
            <h1>Loading...</h1>
          </div>
        </div>
      );
    } else if (this.state.isEditing) {
      return (
        <div className="newpost">
          <h1>Editing Post</h1>
          {this.alert()}
          <form onSubmit={this.onSubmit}>
            <label htmlFor="title">Title</label>
            <input type="text" required placeholder="Copper Mines" name="title" onChange={this.onTitleChange} value={this.state.title} />
            <label htmlFor="description">Description</label>
            <textarea name="description" required rows="3" placeholder="Have fun with others" onChange={this.onDescriptionChange} value={this.state.description} />
            <div className="center">
              <button type="submit">Save Post</button>
              <button type="button" className="cancel" onClick={() => {
                this.setState({
                  isEditing: false,
                  alert: '',
                });
              }}>Cancel</button>
            </div>
          </form>
        </div>
      );
    } else {
      return (
        <div className="viewpost">
          <div className="wrapper">
            <div className="postheader">
              <h1>{this.props.post.title}</h1>
              <div>
                {this.edit()}
                {this.join()}
                {this.delete()}
              </div>
            </div>
            <h3>Author: {this.props.post.author.name}</h3>
            <h4>Members: {this.props.post.responders.map(responder => {
              return responder.name;
            }).join(', ')}</h4>
            <h4>Date: {moment(new Date(this.props.post.created_at)).format('MMMM Do')}</h4>
            <div className="postcontent">
              <p>{this.props.post.description}</p>
            </div>
          </div>
          {this.chat()}
        </div>
      );
    }
  }
}

// connects particular parts of redux state to this components props
const mapStateToProps = (state) => (
  {
    authenticated: state.auth.authenticated,
    post: state.posts.currentPost,
    me: state.users.me,
  }
);


export default connect(mapStateToProps, actions)(PostShow);
