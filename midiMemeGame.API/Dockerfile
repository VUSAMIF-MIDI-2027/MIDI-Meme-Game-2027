FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY MidiMemeGame.Api.csproj ./
RUN dotnet restore MidiMemeGame.Api.csproj

COPY . ./
RUN dotnet publish MidiMemeGame.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /publish \
    /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ARG APP_UID=1003
ARG APP_GID=1003

COPY --from=build /publish ./

RUN mkdir -p App_Data logs \
    && chown -R ${APP_UID}:${APP_GID} /app

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

USER ${APP_UID}:${APP_GID}

ENTRYPOINT ["dotnet", "MidiMemeGame.Api.dll"]