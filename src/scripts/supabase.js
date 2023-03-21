import { createClient } from '@supabase/supabase-js';

const supcredentials = {
	url: 'https://uzkphhitjjeooktrkyud.supabase.co',
	key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3BoaGl0amplb29rdHJreXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg1OTcxNTYsImV4cCI6MTk5NDE3MzE1Nn0.eoNOoKc10Z7WmiqVTpyHogh7e1HzeAipxNmIKX1n_rc'
};

const supabase = createClient(supcredentials.url, supcredentials.key);

export default supabase;
