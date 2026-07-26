function boot(){
  loadAll();
  if(!state.profile){ renderOnboarding(); }
  else{ seedIfEmpty(); renderApp(); }
}
boot();
