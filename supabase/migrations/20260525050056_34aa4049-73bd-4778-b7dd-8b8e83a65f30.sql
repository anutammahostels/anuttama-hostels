
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM public;
