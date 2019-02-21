# Django REST with React

We will build a Print Shop Job application where customers can submit jobs and the print shop staff can see the jobs and fulfill them.

## Setup Django

Create your project folder:

```
cd CODE_FOLDER
mkdir PROJECT_NAME
cd PROJECT_NAME
pipenv install django djangorestframework
```

Setup django:

```
pipenv run django-admin startproject conf .
```

## Jobs App

Create a new app:

```
pipenv startapp jobs
```

Now let’s tell Django how to use the new app.

Open up `./conf/settings.py` and add the app in `INSTALLED_APPS`:

```
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # enable rest framework
    'jobs', # add the jobs app
]
```

So far so good!

With the app in place it’s time to create our first model. We need a Job model.

Since I’m collecting print jobs I can think of a Job model made of the following fields:

a status (unassigned, open, completed)
a name
a message

(Feel free to add extra fields! Like phone for example).

Open up `./jobs/models.py` and create the Job model:

```
from django.db import models

class Job(models.Model):

    STATUS_UNASSIGNED = 'unassigned'
    STATUS_OPEN = 'open'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = (
        (STATUS_UNASSIGNED, 'Unassigned'),
        (STATUS_OPEN, 'Open'),
        (STATUS_COMPLETED, 'Completed'),
    )

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_UNASSIGNED)
    name = models.CharField(max_length=255)
    message = models.CharField(max_length=255)
```

Migrate the project:

```
pipenv run python manage.py migrate
python manage.py makemigrations jobs
pipenv run python manage.py migrate jobs
```

## Django Rest Framework (DRF)

Create a url, viewset, and serializer for your Job model:

jobs/urls.py  
```
from django.contrib import admin
from django.urls import path

from .api import JobViewSet

urlpatterns = [
    path('api/job/', JobViewSet.as_view({
       'get': 'list',
       'post': 'create',
    }), name='job_api'),
]
```

jobs/api.py  
```
from rest_framework.viewsets import ModelViewSet

from .models import Job
from .serializers import JobSerializer


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
```

jobs/serializers.py  
```
from rest_framework import serializers

from .models import Job

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ('id', 'status', 'name', 'message')
        #fields = "__all__"
```

Register your `jobs.urls` in the main project `conf.urls.py` file:

```
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('jobs.urls')),
]
```

Now you should be able to run a sanity check with:

`pipenv run python manage.py runserver`

Head over http://localhost:8000/api/job/ and you’ll see the browsable API

While you’re at it try to create some data through the builtin form.


## Where to install React?

Below I have an exceprt from [Valentino Gagliardi's tutorial on django and react](https://www.valentinog.com/blog/tutorial-api-django-rest-react/#Django_REST_with_React_Django_and_React_together)-


A lot of fellow Python developers struggle with a simple question. How to glue Django and React together?

Should React router take over the routing? Should React mount a component in each Django template? (If you want to lose sanity).

I’d say “it depends”. It depends on how much Javascript do you need. But how much Javascript is too much? (I don’t know, just kidding!)

Jokes aside there are many ways for setting up a Django project with React.

I see the following patterns (which are common to almost every web framework):

 * React in its own “frontend” Django app: load a single HTML template and let React manage the frontend (difficulty: medium)
 * Django REST as a standalone API + React as a standalone SPA (difficulty: hard, it involves JWT for authentication)
 * Mix and match: mini React apps inside Django templates (difficulty: simple)

And here are my advices.

If you’re just starting out with Django REST and React avoid the option 2.

Go for option number 1 (React in its own “frontend” Django app) if:

* you’re building an app-like website
* the interface has lot of user interactions/AJAX
* you’re fine with Session based authentication
* there are no SEO concerns
* you’re fine with React Router

Keeping React closer to Django makes easier to reason about authentication and other stuff.

You can exploit the Django builtin authentication for registering and logging in users.

Use the good ol’ Session authentication and do not worry too much about tokens and JWT.

Go for option number 3 (mini React apps inside Django templates) if:

* the website doesn’t need much Javascript
* you must take care of SEO


## React all the things!!

We will install react into a “frontend” django app.

```
pipenv run python manage.py startapp frontend
cd frontend/static/
```

We will let `npm` manage the static folder, and this is where react will be installed:

```
npm init react-app print_shop .
npm run build
```

We need to hook django to this new react project so:

conf/settings.py  
```
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'jobs',
    'frontend',  # add the forntend app
]

REACT_APP_DIR = 'frontend/static'
```

conf/urls.py  
```
urlpatterns = [
    path('', include('jobs.urls')),
    path('', include('frontend.urls')),
]
```


frontend/urls.py  
```
from django.contrib import admin
from django.urls import path

from .views import IndexView


urlpatterns = [
    path('', IndexView.as_view(), name='index'),
]
```


frontend/views.py  
```
import os

from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings

class IndexView(View):
    """
    Serves the compiled frontend entry point (only works if you have run `npm
    run build`).
    """

    def get(self, request):
        try:
            with open(os.path.join(settings.REACT_APP_DIR, 'build', 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse(
                """
                This URL is only used when you have built the production
                version of the app. Visit http://localhost:3000/ instead, or
                run `yarn run build` to test the production version.
                """,
                status=501,
            )
```


To make ajax requests from localhost:3000 to localhost:8000 we need to enable CORs.


frontend/middleware.py  
```
def dev_cors_middleware(get_response):
    """
    Adds CORS headers for local testing only to allow the frontend, which is served on
    localhost:3000, to access the API, which is served on localhost:8000.
    """

    def middleware(request):
        response = get_response(request)

        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, OPTIONS, DELETE, HEAD'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

    return middleware
```

conf/settings.py
```
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'frontend.middleware.dev_cors_middleware',  # add the CORs middleware
]
```

We also need to tell django where the react build files are located:

conf/settings.py  
```
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'

# See: https://docs.djangoproject.com/en/dev/ref/settings/#static-root
STATIC_ROOT = os.path.normpath(os.path.join(BASE_DIR, 'staticfiles'))

# See: https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Extra places for collectstatic to find static files.
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'frontend/static/build/static'),
)
```

Now let's make sure everyting is working!

```
pipenv run python manage.py runserver
```

You should see the react start screen at http://localhost:8000/

## Build a React Project

While django is running we will ALSO run react:

```
npm start
```

Create the following foloders:

```
frontend/static/src/components/
frontend/static/src/container/
```

`components` is for dumb components and `container` is for smart compoents.


### AJAX Addresses

Because you will use `localhost:8000` when writting our ajax requests so we want that stored in a variable. We will use an environment variable so that when we deploy to heroku we can automatically NOT use localhost:8000.

Create the following files:

.env  
```
REACT_APP_API_HOST=''
```

.env.development  
```
REACT_APP_API_HOST=//localhost:8000
```

Create React App will automatically use those files. Yay!


### App Component

Update index.js with the following:

frontend/static/src/index.js  
```
import React from 'react';
import ReactDOM from 'react-dom';
import App from './container/App.jsx';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
```

Create a stateful component in a new file named `./frontend/src/container/App.jsx`:

```
import React, { Component } from 'react';
import JobTable from '../components/JobTable.jsx';
import JobForm from '../components/JobForm.jsx';


class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      loaded: false,
      placeholder: 'Loading...',
      jobs: []
    };
  }

  componentDidMount(){
    // For development we will run django AND npm start
    // Django will run on port 8000 while react will run on port 3000
    // We need our API calls to point to django, so we will use process.env.REACT_APP_API_HOST
    // process.env.REACT_APP_API_HOST is set using a .env.development file.
    // https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables

    fetch(`${process.env.REACT_APP_API_HOST}/api/job/`).then((response) => {
      if (response.status !== 200) {
        return this.setState({placeholder: "Something went wrong"});
      }

      return response.json();
    }).then((data) => {
      this.setState({jobs: data, loaded: true});
    });
  }

  addJob = (job) => {
    // Optimistically add the job to the jobs array on the state
    // const {jobs} = this.state;
    // jobs.push(job);
    // this.setState({jobs: jobs});

    const conf = {
      method: "post",
      body: JSON.stringify(job),
      headers: new Headers({"Content-Type": "application/json"})
    };

    fetch(`${process.env.REACT_APP_API_HOST}/api/job/`, conf).then((response) => {
      if (response.status !== 201) {
        // There was an error so roll back the state
        // var jobs = this.state.jobs;
        // jobs.pop();
        // return this.setState({placeholder: "Something went wrong", jobs: jobs});

        return this.setState({placeholder: "Something went wrong"});
      }

      return response.json();
    }).then((job) => {
      const {jobs} = this.state;
      jobs.push(job);
      this.setState({jobs: jobs});
    });
  };

  render() {
    if(!this.state.loaded){
      var loadingMessage = <p className="alert-danger">{this.state.placeholder}</p>;
    }else{
      var loadingMessage = null;
    }

    return (
      <div className="App">

        {loadingMessage}

        <h1>Print Jobs</h1>

        <JobForm addJob={this.addJob}/>

        <hr/>

        <h2>Create a Print Job</h2>

        <h2>Print Queue</h2>

        <JobTable jobs={this.state.jobs}/>
      </div>
    );
  }
}

export default App;
```


### The Table component

A stateless component for displaying data within a table.

Create a new file named `./frontend/src/components/JobTable.jsx`:

```
import React from "react";
import PropTypes from "prop-types";


function JobTable(props){
  var jobs = props.jobs;

  return !jobs.length ? (
    <p>No jobs</p>
  ) : (
    <div className="column">
      <h2 className="subtitle">
        Showing <strong>{jobs.length} items</strong>
      </h2>

      <table className="table is-striped">
        <thead>
          <tr>
            {Object.entries(jobs[0]).map(el => <th key={el[0]}>{el[0]}</th>)}
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              {Object.entries(job).map(el => <td key={`${job.id}-${el[0]}`}>{el[1]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

JobTable.propTypes = {
  jobs: PropTypes.array.isRequired
};

export default JobTable;
```

### The Form component

Create a new file named `./frontend/src/components/JobForm.jsx`:

```
import React, {Component} from "react";
import PropTypes from "prop-types";


class JobForm extends Component {
  state = {
    status: "",
    name: "",
    message: ""
  };

  handleChange = e => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleSubmit = e => {
    e.preventDefault();

    const {status, name, message} = this.state;
    const job = {status, name, message};

    this.props.addJob(job);
    this.setState({status: '', name: '', message: ''});
  };

  render() {
    const {status, name, message} = this.state;

    return (
      <div className="column">
        <form onSubmit={this.handleSubmit}>

          <div className="field">
            <label className="label">Status</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="status"
                onChange={this.handleChange}
                value={status}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="name"
                onChange={this.handleChange}
                value={name}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Message</label>
            <div className="control">
              <textarea
                className="textarea"
                type="text"
                name="message"
                onChange={this.handleChange}
                value={message}
                required
              />
            </div>
          </div>

          <div className="control">
            <button type="submit" className="button is-info">
              Send message
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default JobForm;
```



