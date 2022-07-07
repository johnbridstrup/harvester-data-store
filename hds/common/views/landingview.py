from django.contrib.auth import authenticate
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from forms.loginform import LoginForm
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import login, logout
from rest_framework.views import APIView


class LandingView(APIView):
    """view for the Home Page"""
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, *args, **kwargs):
        return Response(template_name='./home.html')


class UserLoginView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)
    template_name = 'login.html'
    form_class = LoginForm

    def get(self, request):
        # if user is already logged in, redirect to home page
        if request.user.is_authenticated:
            return redirect('/')

        form = self.form_class()
        return render(request, self.template_name, context={'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('/')
            else:
                message = 'invalid username or password'
                return render(request, self.template_name, context={'form': form, 'message': message})
        else:
            message = 'invalid username or password'
            return render(request, self.template_name, context={'form': form, 'message': message})        


class UserLogoutView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, *args, **kwargs):
        logout(request)
        return redirect('/')        
