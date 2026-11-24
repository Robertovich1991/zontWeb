using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

public class ComfortCarsApiClient
{
    private readonly HttpClient _http;

    private const string BaseUrl = "https://www.zont.cab/api/partners/comfort-cars";
    private const string ApiKey  = "cc_ec5jFS3QyGBvLIutJf-0QFRO04HLnGgFPa-LnxAx_lc";

    public ComfortCarsApiClient()
    {
        _http = new HttpClient();
        // The key is sent on every request via the X-API-Key header
        _http.DefaultRequestHeaders.Add("X-API-Key", ApiKey);
    }

    // GET /reservations  (with optional filters + pagination)
    public async Task<ReservationsResponse> GetReservationsAsync(
        string dateFrom = null, string dateTo = null, string status = null,
        int page = 1, int pageSize = 50)
    {
        var query = $"?page={page}&page_size={pageSize}";
        if (!string.IsNullOrEmpty(dateFrom)) query += $"&date_from={dateFrom}";
        if (!string.IsNullOrEmpty(dateTo))   query += $"&date_to={dateTo}";
        if (!string.IsNullOrEmpty(status))   query += $"&status={status}";

        var resp = await _http.GetAsync($"{BaseUrl}/reservations{query}");
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<ReservationsResponse>();
    }

    // GET /reservations/{id}
    public async Task<Reservation> GetReservationAsync(int id)
    {
        var resp = await _http.GetAsync($"{BaseUrl}/reservations/{id}");
        if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<Reservation>();
    }
}

// ---- Models ----
public class ReservationsResponse
{
    public Reservation[] data { get; set; }
    public Pagination pagination { get; set; }
}

public class Pagination
{
    public int page { get; set; }
    public int page_size { get; set; }
    public int total { get; set; }
    public int total_pages { get; set; }
}

public class Reservation
{
    public int id { get; set; }
    public string status { get; set; }        // normalized
    public string statusRaw { get; set; }
    public string date { get; set; }          // YYYY-MM-DD
    public string time { get; set; }          // HH:MM
    public string startDate { get; set; }
    public string pickupAddress { get; set; }
    public string dropoffAddress { get; set; }
    public string vehicleType { get; set; }
    public string tripType { get; set; }
    public double distanceKm { get; set; }
    public double amount { get; set; }
    public double currentPrice { get; set; }
    public string currency { get; set; }
    public bool isFixedPrice { get; set; }
    public bool paymentSuccessful { get; set; }
    public Person client { get; set; }
    public Person driver { get; set; }         // null if not assigned
    public string company { get; set; }
    public string comments { get; set; }
}

public class Person
{
    public string firstName { get; set; }
    public string lastName { get; set; }
    public string phone { get; set; }          // client only
}

// ---- Example usage ----
public static class Demo
{
    public static async Task Main()
    {
        var api = new ComfortCarsApiClient();

        // All completed rides since June 1st, first page
        var result = await api.GetReservationsAsync(
            dateFrom: "2026-06-01", status: "completed", page: 1, pageSize: 50);

        Console.WriteLine($"Total: {result.pagination.total} ({result.pagination.total_pages} pages)");
        foreach (var r in result.data)
            Console.WriteLine($"#{r.id} {r.date} {r.time} | {r.pickupAddress} -> {r.dropoffAddress} | {r.amount}{r.currency} | {r.status}");

        // One reservation
        var one = await api.GetReservationAsync(123);
        Console.WriteLine(one == null ? "Not found" : $"Client: {one.client.firstName} {one.client.lastName}");
    }
}
