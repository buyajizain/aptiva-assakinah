<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_nip(): void
    {
        $user = User::factory()->create([
            'nip' => '198501012010011001',
            'role' => 'admin_tu',
            'password' => bcrypt('Admin123!'),
            'must_change_password' => false,
        ]);

        $response = $this->post('/login', [
            'login' => '198501012010011001',
            'password' => 'Admin123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_authenticate_using_email(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@sekolah.sch.id',
            'role' => 'admin_tu',
            'password' => bcrypt('Admin123!'),
            'must_change_password' => false,
        ]);

        $response = $this->post('/login', [
            'login' => 'admin@sekolah.sch.id',
            'password' => 'Admin123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_guru_device_binding_locks_to_first_device(): void
    {
        $guru = User::factory()->create([
            'nip' => '199008202015022003',
            'role' => 'guru',
            'password' => bcrypt('Guru123!'),
            'device_id' => null,
            'must_change_password' => false,
        ]);

        // Login pertama dengan device_1
        $this->post('/login', [
            'login' => '199008202015022003',
            'password' => 'Guru123!',
            'device_id' => 'device_hp_oppo_123',
        ]);

        $this->assertAuthenticated();
        $this->assertEquals('device_hp_oppo_123', $guru->fresh()->device_id);

        $this->post('/logout');
        $this->assertGuest();

        // Login kedua dengan device_2 yang berbeda -> Ditolak!
        $response = $this->post('/login', [
            'login' => '199008202015022003',
            'password' => 'Guru123!',
            'device_id' => 'device_hp_samsung_different',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('login');
    }

    public function test_user_must_change_password_is_redirected(): void
    {
        $user = User::factory()->create([
            'nip' => '199503122020121004',
            'role' => 'guru',
            'password' => bcrypt('Guru123!'),
            'must_change_password' => true,
        ]);

        $this->actingAs($user);

        $response = $this->get('/dashboard');
        $response->assertRedirect(route('password.change'));
    }

    public function test_user_can_update_required_password(): void
    {
        $user = User::factory()->create([
            'nip' => '199503122020121004',
            'role' => 'guru',
            'password' => bcrypt('Guru123!'),
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($user)->post('/change-password', [
            'password' => 'PasswordBaru123!',
            'password_confirmation' => 'PasswordBaru123!',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertFalse($user->fresh()->must_change_password);
    }
}
